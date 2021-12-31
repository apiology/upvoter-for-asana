/**
 * upvoter module.
 *
 * Quickly finds and increments integer custom fields in Asana tasks
 * from the Chrome Omnibox.
 */

import * as Asana from 'asana';

import { chromeStorageSyncFetch, chromeStorageSyncStore } from './storage';
import {
  fetchClient, findGid, fetchWorkspaceGid, pullResult, formatTask,
} from './asana-typeahead';
import { fetchCustomFieldName, fetchIncrement } from './config';
import { logError } from './error';

let fetchedCustomFieldGid: string | null = null;

export const fetchCustomFieldGid = async (): Promise<string> => {
  const workspaceGid = await fetchWorkspaceGid();

  if (fetchedCustomFieldGid != null) {
    return fetchedCustomFieldGid;
  }

  fetchedCustomFieldGid = await chromeStorageSyncFetch('customFieldGid');
  if (fetchedCustomFieldGid != null) {
    return fetchedCustomFieldGid;
  }

  const client = await fetchClient();
  const customFields = await client.customFields.getCustomFieldsForWorkspace(workspaceGid, {});
  const customFieldName = await fetchCustomFieldName();
  fetchedCustomFieldGid = await findGid(customFields,
    (customField) => customField.name === customFieldName);
  if (fetchedCustomFieldGid == null) {
    logError('Could not find custom field GID!');
  }
  chromeStorageSyncStore('customFieldGid', fetchedCustomFieldGid);

  return fetchedCustomFieldGid;
};

export const upvoteTask = async (
  task: Asana.resources.Tasks.Type
): Promise<Asana.resources.Tasks.Type> => {
  console.log('upvoteTask got task', task);
  const upvotesCustomFieldGid = await fetchCustomFieldGid();
  const customField = task.custom_fields.find((field) => field.gid === upvotesCustomFieldGid);
  if (customField == null) {
    logError('Expected to find custom field on task!');
  }
  let currentValue = customField.number_value;
  if (currentValue == null) {
    currentValue = 1;
  }
  // https://developers.asana.com/docs/update-a-task
  const increment = await fetchIncrement();
  const newValue: number = increment ? currentValue + 1 : currentValue - 1;
  const updatedCustomFields: { [index: string]: number } = {};
  updatedCustomFields[upvotesCustomFieldGid] = newValue;
  const client = await fetchClient();
  const updatedTask = await client.tasks.updateTask(
    task.gid,
    { custom_fields: updatedCustomFields }
  );
  return updatedTask;
};

export const logSuccess = (result: string | object): void => console.log('Upvoted task:', result);

export const pullCustomField = async (task: Asana.resources.Tasks.Type) => {
  const upvotesCustomFieldGid = await fetchCustomFieldGid();

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
  const client = await fetchClient();
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
