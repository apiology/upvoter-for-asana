/**
 * upvoter module.
 *
 * Quickly finds and increments integer custom fields in Asana tasks
 * from the Chrome Omnibox.
 */

import * as Asana from 'asana';

import { fetchClient, findGid, fetchWorkspaceGid } from './asana-base.js';
import { pullResult } from './asana-typeahead.js';
import { platform } from './platform.js';

let fetchedCustomFieldGid: string | null = null;

export const fetchCustomFieldGid = async (): Promise<string> => {
  const p = platform();
  const cache = p.cache();
  const config = p.config();
  const workspaceGid = await fetchWorkspaceGid();

  if (fetchedCustomFieldGid != null) {
    return fetchedCustomFieldGid;
  }

  fetchedCustomFieldGid = await cache.cacheFetch('customFieldGid', 'string');
  if (fetchedCustomFieldGid != null) {
    return fetchedCustomFieldGid;
  }

  const client = await fetchClient();
  const customFields = await client.customFields.getCustomFieldsForWorkspace(workspaceGid, {});
  const customFieldName = await config.fetchCustomFieldName();
  fetchedCustomFieldGid = await findGid(customFields,
    (customField) => customField.name === customFieldName);
  if (fetchedCustomFieldGid == null) {
    throw new Error('Could not find custom field GID!');
  }
  cache.cacheStore('customFieldGid', fetchedCustomFieldGid);

  return fetchedCustomFieldGid;
};

export const upvoteTask = async (
  task: Asana.resources.Tasks.Type,
  amountToUpvote = 1
): Promise<Asana.resources.Tasks.Type> => {
  const config = platform().config();
  console.log('upvoteTask got task', task);
  const upvotesCustomFieldGid = await fetchCustomFieldGid();
  const customField = task.custom_fields.find((field) => field.gid === upvotesCustomFieldGid);
  if (customField == null) {
    throw new Error(`Expected to find custom field on task with gid ${upvotesCustomFieldGid}!`);
  }
  let currentValue = customField.number_value;
  if (currentValue == null) {
    currentValue = 1;
  }
  // https://developers.asana.com/docs/update-a-task
  const increment = await config.fetchIncrement();
  const newValue: number = increment
    ? currentValue + amountToUpvote : currentValue - amountToUpvote;
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

export const actOnInputData = async (taskGid: string) => {
  const config = platform().config();
  const client = await fetchClient();
  let task = await client.tasks.getTask(taskGid);
  const omniboxIncrementAmount = await config.fetchManualIncrementAmount();
  task = await upvoteTask(task, omniboxIncrementAmount);
  return task;
};

// https://stackoverflow.com/questions/43118692/typescript-filter-out-nulls-from-an-array
function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
  return value !== null && value !== undefined;
}

export type Suggestion = {
  url: string;
  description: string;
}

const createSuggestResult = async (
  task: Asana.resources.Tasks.Type
): Promise<Suggestion | null> => {
  const formatter = platform().formatter();
  const customField = await pullCustomField(task);

  if (customField === undefined) {
    return null;
  }

  const upvotes = customField.number_value || 0;

  const url = `{{cookiecutter.project_slug}}:${encodeURIComponent(task.gid)}`;

  return {
    url,
    description: formatter.formatUpvotedTask(upvotes, task),
  };
};

export const pullSuggestions = async (text: string): Promise<Suggestion[]> => {
  const typeaheadResult = await pullResult(text);
  const logger = platform().logger();
  logger.userVisibleStatus('Processing results...');
  logger.log('typeaheadResult: ', typeaheadResult);

  const suggestionPromises = typeaheadResult.data
    .filter((task) => !task.completed)
    .filter((task) => task.parent == null)
    .filter((task) => task.name.length > 0)
    .map(createSuggestResult);

  const suggestions = (await Promise.all(suggestionPromises)).filter(notEmpty);
  return suggestions;
};
