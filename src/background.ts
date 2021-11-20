// https://github.com/GoogleChrome/chrome-extensions-samples/blob/1d8d137d20fad5972292377dc22498529d2a4039/api/omnibox/simple-example/background.js

import * as _ from 'lodash';
import * as Asana from 'asana';
import { Gid } from './asana-types';
import { SuggestFunction } from './chrome-types';

import {
  logError as logErrorOrig, escapeHTML, pullTypeaheadSuggestions, upvoteTask,
  client, logSuccess, pullCustomField,
} from './upvoter';

// As of 4.4.4, TypeScript's control flow analysis is wonky with
// narrowing and functions that return never.  This is a workaround:
//
// https://github.com/microsoft/TypeScript/issues/36753
const logError: (err: string) => never = logErrorOrig;

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

const passOnTypeaheadResultToOmnibox = async (
  text: string,
  suggest: SuggestFunction,
  typeaheadResult: Asana.resources.ResourceList<Asana.resources.Tasks.Type>
) => {
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

  console.log(`${suggestions.length} suggestions from ${text}:`, suggestions);
  suggest(suggestions);
  const description = `<dim>${suggestions.length} results for ${text}:</dim>`;
  chrome.omnibox.setDefaultSuggestion({ description });
};

const pullAndReportTypeaheadSuggestions = async (text: string, suggest: SuggestFunction) => {
  try {
    const typeaheadResult = await pullTypeaheadSuggestions(text);
    await passOnTypeaheadResultToOmnibox(text, suggest, typeaheadResult);
  } catch (err) {
    logError(`Problem getting suggestions for ${text}: ${err}`);
  }
};

const pullAndReportTypeaheadSuggestionsDebounced = _.debounce(pullAndReportTypeaheadSuggestions,
  500);

const omniboxInputChangedListener = (text: string, suggest: SuggestFunction) => {
  chrome.omnibox.setDefaultSuggestion({
    description: `<dim>Waiting for results from ${text}...</dim>`,
  });
  return pullAndReportTypeaheadSuggestionsDebounced(text, suggest);
};

// This event is fired each time the user updates the text in the omnibox,
// as long as the extension's keyword mode is still active.
chrome.omnibox.onInputChanged.addListener(omniboxInputChangedListener);

const omniboxInputEnteredListener = async (taskGid: Gid) => {
  try {
    let task = await client.tasks.getTask(taskGid);
    task = await upvoteTask(task);
    logSuccess(task);
  } catch (err) {
    logError(`Failed to upvote ${taskGid}: ${err}`);
  }
};

// This event is fired with the user accepts the input in the omnibox.
chrome.omnibox.onInputEntered.addListener(omniboxInputEnteredListener);
