import * as Asana from 'asana';
import { Gid } from './asana-types';
import {
  asanaAccessToken, customFieldName, increment, workspaceName,
} from './config';

export const client = Asana.Client.create().useAccessToken(asanaAccessToken);

const logErrorOrig = (err: string): never => {
  alert(err);
  throw err;
};

// As of 4.4.4, TypeScript's control flow analysis is wonky with
// narrowing and functions that return never.  This is a workaround:
//
// https://github.com/microsoft/TypeScript/issues/36753
export const logError: (err: string) => never = logErrorOrig;

const findAndSaveCustomFieldGid = (
  customFieldsResult: Asana.resources.ResourceList<Asana.resources.CustomFields.Type>
) => new Promise<string | null>((resolve, reject) => {
  // If I had esnext.asynciterable in
  // tsconfig.json#compilerOptions.lib, and if node-asana's
  // BufferedReadable supported async iterators, I could do:
  //
  // for await (const customField of customFieldsResult.stream()) {
  //   if (saveCustomFieldGidIfRightName(customField)) {
  //     return;
  //   }
  // }
  //
  // as-is, that gives me this error from tsc: Type
  // 'ResourceStream<Type>' must have a '[Symbol.asyncIterator]()'
  // method that returnsan async
  // iterator. [2504]
  //
  // https://github.com/Asana/node-asana/blob/8db5f44ff9acb8df04317c5c4db0ac4a300ba8b0/lib/util/buffered_readable.js
  // https://stackoverflow.com/questions/44013020/using-promises-with-streams-in-node-js
  // https://stackoverflow.com/questions/47219503/how-do-async-iterators-work-error-ts2504-type-must-have-a-symbol-asynciterat
  const stream = customFieldsResult.stream();
  stream.on('data', (customField: Asana.resources.CustomFields.Type) => {
    if (customField.name === customFieldName) {
      console.log(`Found custom field GID as ${customField.gid}`);
      resolve(customField.gid);
    }
  });
  stream.on('end', () => resolve(null));
  stream.on('finish', () => resolve(null));
  stream.on('error', () => reject());
});

const findAndSaveWorkspaceGid = (
  workspacesResult: Asana.resources.ResourceList<Asana.resources.Workspaces.Type>
) => new Promise<string | null>((resolve, reject) => {
  // https://stackoverflow.com/questions/44013020/using-promises-with-streams-in-node-js
  const stream = workspacesResult.stream();
  stream.on('data', (workspace: Asana.resources.Workspaces.Type) => {
    if (workspace.name === workspaceName) {
      console.log(`Found workspace GID as ${workspace.gid}`);
      resolve(workspace.gid);
    }
  });
  stream.on('end', () => resolve(null));
  stream.on('finish', () => resolve(null));
  stream.on('error', () => reject());
});

export const gidFetch: Promise<{ customFieldGid: Gid, workspaceGid: Gid }> = (async () => {
  const workspaces = await client.workspaces.getWorkspaces();
  const workspaceGid = await findAndSaveWorkspaceGid(workspaces);
  if (workspaceGid == null) {
    logError('Could not find workspace GID!');
  }

  const customFields = await client.customFields.getCustomFieldsForWorkspace(workspaceGid, {});
  const customFieldGid = await findAndSaveCustomFieldGid(customFields);
  if (customFieldGid == null) {
    logError('Could not find custom field GID!');
  }

  return { customFieldGid, workspaceGid };
})();

export const pullCustomFieldGid = async (): Promise<Gid> => (await gidFetch).customFieldGid;

export const pullWorkspaceGid = async (): Promise<Gid> => (await gidFetch).workspaceGid;

// How on God's green earth is there no built-in function to do this?
//
// https://stackoverflow.com/questions/40263803/native-javascript-or-es6-way-to-encode-and-decode-html-entities
export const escapeHTML = (str: string) => {
  const escape = (tag: string): string => {
    const s = ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;',
    }[tag]);
    if (s == null) {
      logError('Error in regexp logic!');
    }
    return s;
  };
  return str.replace(/[&<>'"]/g, escape);
};

export const pullResult = async (text: string) => {
  const query: Asana.resources.Typeahead.TypeaheadParams = {
    resource_type: 'task',
    query: text,
    opt_pretty: true,
    opt_fields: ['name', 'completed', 'parent.name', 'custom_fields.gid', 'custom_fields.number_value', 'memberships.project.name'],
  };
  await gidFetch;

  const workspaceGid = await pullWorkspaceGid();

  console.log('requesting typeahead with workspaceGid', workspaceGid,
    ' and query of ', query);
  chrome.omnibox.setDefaultSuggestion({
    description: `<dim>Searching for ${text}...</dim>`,
  });

  // https://developers.asana.com/docs/typeahead
  const typeaheadResult = await client.typeahead.typeaheadForWorkspace(workspaceGid, query);

  return typeaheadResult;
};

export const upvoteTask = async (
  task: Asana.resources.Tasks.Type
): Promise<Asana.resources.Tasks.Type> => {
  console.log('upvoteTask got task', task);
  const upvotesCustomFieldGid = await pullCustomFieldGid();
  const customField = task.custom_fields.find((field) => field.gid === upvotesCustomFieldGid);
  if (customField == null) {
    logError('Expected to find custom field on task!');
  }
  let currentValue = customField.number_value;
  if (currentValue == null) {
    currentValue = 1;
  }
  // https://developers.asana.com/docs/update-a-task
  const newValue: number = increment ? currentValue + 1 : currentValue - 1;
  const updatedCustomFields: { [index: string]: number } = {};
  updatedCustomFields[upvotesCustomFieldGid] = newValue;
  const updatedTask = await client.tasks.updateTask(
    task.gid,
    { custom_fields: updatedCustomFields }
  );
  return updatedTask;
};

export const logSuccess = (result: string | object): void => console.log('Upvoted task:', result);

export const pullCustomField = async (
  task: Asana.resources.Tasks.Type
) => {
  const upvotesCustomFieldGid = await pullCustomFieldGid();

  const customField = task.custom_fields.find((field) => field.gid === upvotesCustomFieldGid);

  return customField;
};

const createSuggestResult = async (
  task: Asana.resources.Tasks.Type
): Promise<chrome.omnibox.SuggestResult | null> => {
  const customField = await pullCustomField(task);

  if (customField === undefined) {
    return null;
  }

  const project = task.memberships[0]?.project;

  let membership = '';
  if (task.parent != null) {
    membership += ` / ${escapeHTML(task.parent.name)}`;
  }
  if (project != null) {
    membership += ` <dim>${project.name}</dim>`;
  }

  const description = `<dim>${customField.number_value}</dim>: ${escapeHTML(task.name)}${membership}`;

  return {
    content: task.gid,
    description,
  };
};

// https://stackoverflow.com/questions/43118692/typescript-filter-out-nulls-from-an-array
function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
  return value !== null && value !== undefined;
}

export const actOnInputData = async (taskGid: Gid) => {
  let task = await client.tasks.getTask(taskGid);
  task = await upvoteTask(task);
  return task;
};

export const pullOmniboxSuggestions = async (text: string) => {
  const typeaheadResult = await pullResult(text);
  chrome.omnibox.setDefaultSuggestion({
    description: '<dim>Processing results...</dim>',
  });
  console.log('typeaheadResult: ', typeaheadResult);

  const suggestionPromises = typeaheadResult.data
    .filter((task) => !task.completed)
    .filter((task) => task.parent == null)
    .filter((task) => task.name.length > 0)
    .map(createSuggestResult);

  const suggestions = (await Promise.all(suggestionPromises)).filter(notEmpty);
  return suggestions;
};
