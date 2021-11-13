// https://github.com/GoogleChrome/chrome-extensions-samples/blob/1d8d137d20fad5972292377dc22498529d2a4039/api/omnibox/simple-example/background.js

import * as _ from 'lodash';
import { Gid } from './asana-types.ts';

import {
  pullCustomFieldGid, escapeHTML, pullTypeaheadSuggestions, upvoteTask,
  client, logSuccess, pullCustomFieldFn,
} from './upvoter.ts';

type SuggestFunction = (suggestResults: chrome.omnibox.SuggestResult[]) => void;

const passOnTypeaheadResultToOmnibox = (text: string) => ({ suggest, typeaheadResult }:
  { suggest: SuggestFunction, typeaheadResult }) => {
  chrome.omnibox.setDefaultSuggestion({
    description: '<dim>Processing results...</dim>',
  });
  console.log('typeaheadResult: ', typeaheadResult);
  return pullCustomFieldGid().then((customFieldGid: Gid) => {
    const suggestions = typeaheadResult.data.filter((task) => !task.completed)
      .filter((task) => task.parent == null)
      .filter((task) => task.name.length > 0)
      .map(pullCustomFieldFn(customFieldGid))
      .filter(({ customField }) => customField != null)
      .map(({ task, customField }) => ({
        content: task.gid,
        description: escapeHTML(`${customField.number_value}: ${task.name}`),
      }));
    console.log(`${suggestions.length} suggestions from ${text}:`, suggestions);
    suggest(suggestions);
    const description = `<dim>${suggestions.length} results for ${text}:</dim>`;
    chrome.omnibox.setDefaultSuggestion({ description });
  });
};

const logError = (err: string) => {
  alert(err);
  throw err;
};

const pullAndReportTypeaheadSuggestions = (text: string, suggest: SuggestFunction) => {
  pullTypeaheadSuggestions(text, suggest).then(passOnTypeaheadResultToOmnibox(text))
    .catch(logError);
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

const omniboxInputEnteredListener = (taskGid: Gid) => {
  client.tasks.getTask(taskGid)
    .then(upvoteTask)
    .then(logSuccess)
    .catch(logError);
};

// This event is fired with the user accepts the input in the omnibox.
chrome.omnibox.onInputEntered.addListener(omniboxInputEnteredListener);
