/**
 * upvoter module.
 *
 * Quickly finds and increments integer custom fields in Asana tasks
 * from the Chrome Omnibox.
 */

import * as Asana from 'asana';

import {
  client, workspaceGidFetch, pullResult, formatTask,
} from './asana-typeahead';
import { customFieldName, increment } from './config';
import { logError } from './error';

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

export const customFieldGidFetch: Promise<string> = (async () => {
  const workspaceGid = await workspaceGidFetch;
  const customFields = await client.customFields.getCustomFieldsForWorkspace(workspaceGid, {});
  const customFieldGid = await findAndSaveCustomFieldGid(customFields);
  if (customFieldGid == null) {
    logError('Could not find custom field GID!');
  }

  return customFieldGid;
})();

export const upvoteTask = async (
  task: Asana.resources.Tasks.Type
): Promise<Asana.resources.Tasks.Type> => {
  console.log('upvoteTask got task', task);
  const upvotesCustomFieldGid = await customFieldGidFetch;
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

export const pullCustomField = async (task: Asana.resources.Tasks.Type) => {
  const upvotesCustomFieldGid = await customFieldGidFetch;

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

  const description = `<dim>${customField.number_value}</dim>: ${formatTask(task)}`;

  return {
    content: task.gid,
    description,
  };
};

export const actOnInputData = async (taskGid: string) => {
  let task = await client.tasks.getTask(taskGid);
  task = await upvoteTask(task);
  return task;
};

// https://stackoverflow.com/questions/43118692/typescript-filter-out-nulls-from-an-array
function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
  return value !== null && value !== undefined;
}

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
