/**
 * background module.
 *
 * Registers listeners with chrome.omnibox API.  Initialized when
 * browser extension is loaded.
 */

// https://github.com/GoogleChrome/chrome-extensions-samples/blob/1d8d137d20fad5972292377dc22498529d2a4039/api/omnibox/simple-example/background.js

import * as _ from 'lodash';
import {
  actOnInputData, logSuccess, pullOmniboxSuggestions,
} from './upvoter-for-asana.js';

type SuggestFunction = (suggestResults: chrome.omnibox.SuggestResult[]) => void;

const populateOmnibox = async (text: string, suggest: SuggestFunction) => {
  const suggestions = await pullOmniboxSuggestions(text);
  suggest(suggestions);
  console.log(`${suggestions.length} suggestions from ${text}:`, suggestions);
  const description = `<dim>${suggestions.length} results for ${text}:</dim>`;
  chrome.omnibox.setDefaultSuggestion({ description });
};

const pullAndReportSuggestions = async (text: string, suggest: SuggestFunction) => {
  try {
    await populateOmnibox(text, suggest);
  } catch (err) {
    alert(`Problem getting suggestions for ${text}: ${err}`);
    throw err;
  }
};

const pullAndReportSuggestionsDebounced = _.debounce(pullAndReportSuggestions,
  500);

const omniboxInputChangedListener = (text: string, suggest: SuggestFunction) => {
  chrome.omnibox.setDefaultSuggestion({
    description: `<dim>Waiting for results from ${text}...</dim>`,
  });
  return pullAndReportSuggestionsDebounced(text, suggest);
};

// This event is fired each time the user updates the text in the omnibox,
// as long as the extension's keyword mode is still active.
chrome.omnibox.onInputChanged.addListener(omniboxInputChangedListener);

const omniboxInputEnteredListener = async (inputData: string) => {
  try {
    const out = await actOnInputData(inputData);
    logSuccess(out);
  } catch (err) {
    alert(`Failed to process ${inputData}: ${err}`);
    throw err;
  }
};

// This event is fired with the user accepts the input in the omnibox.
chrome.omnibox.onInputEntered.addListener(omniboxInputEnteredListener);
