import * as Asana from 'asana';
import { Gid } from './asana-types';
import {
  asanaAccessToken, customFieldName, increment, workspaceName,
} from './config';

export const client = Asana.Client.create().useAccessToken(asanaAccessToken);

let workspaceGid: Gid | null = null;

let customFieldGid: Gid | null = null;

const saveCustomFieldGidIfRightName = (customField: Asana.resources.CustomFields.Type,
  resolve: () => void) => {
  if (customField.name === customFieldName) {
    customFieldGid = customField.gid;
    console.log(`Found custom field GID as ${customFieldGid}`);
    resolve();
  }
};

const findAndSaveCustomFieldGid = (
  customFieldsResult: Asana.resources.ResourceList<Asana.resources.CustomFields.Type>
) => new Promise<void>((resolve, reject) => {
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
  stream.on('data', (customField: Asana.resources.CustomFields.Type) => saveCustomFieldGidIfRightName(customField, resolve));
  stream.on('end', () => resolve());
  stream.on('finish', () => resolve());
  stream.on('error', () => reject());
});

const saveWorkspaceAndCustomFieldGidsIfRightNames = (workspace: Asana.resources.Workspaces.Type,
  resolve: ((value: void | PromiseLike<void>) => void)) => {
  if (workspace.name === workspaceName) {
    workspaceGid = workspace.gid;
    console.log(`Found workspace GID as ${workspaceGid}`);
    resolve(client.customFields.getCustomFieldsForWorkspace(workspaceGid, {})
      .then(findAndSaveCustomFieldGid));
  }
};

const findAndSaveWorkspaceAndCustomFieldGids = (
  workspacesResult: Asana.resources.ResourceList<Asana.resources.Workspaces.Type>
) => new Promise<void>((resolve, reject) => {
  // https://stackoverflow.com/questions/44013020/using-promises-with-streams-in-node-js
  const stream = workspacesResult.stream();
  stream.on('data', (
    workspace: Asana.resources.Workspaces.Type
  ) => saveWorkspaceAndCustomFieldGidsIfRightNames(workspace, resolve));
  stream.on('end', () => resolve());
  stream.on('finish', () => resolve());
  stream.on('error', () => reject());
});

// start this fetch as soon as this file is evaluated, to avoid delay
// on first use.
export const gidFetch = client.workspaces.getWorkspaces()
  .then(findAndSaveWorkspaceAndCustomFieldGids);

const logErrorOrig = (err: string): never => {
  alert(err);
  throw err;
};

// As of 4.4.4, TypeScript's control flow analysis is wonky with
// narrowing and functions that return never.  This is a workaround:
//
// https://github.com/microsoft/TypeScript/issues/36753
export const logError: (err: string) => never = logErrorOrig;

export const pullCustomFieldGid = async (): Promise<Gid> => {
  await gidFetch;
  if (customFieldGid == null) {
    logError('customFieldGid fetch failed!');
  }
  return customFieldGid;
};

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

class NotInitializedError extends Error { }

export const pullTypeaheadSuggestions = async (text: string) => {
  const query: Asana.resources.Typeahead.TypeaheadParams = {
    resource_type: 'task',
    query: text,
    opt_pretty: true,
    opt_fields: ['name', 'completed', 'parent', 'custom_fields.gid', 'custom_fields.number_value'],
  };
  await gidFetch;

  if (workspaceGid == null) {
    alert('NOT INITIALIZED!');
    throw new NotInitializedError();
  }

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
