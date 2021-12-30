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
} from './upvoter-for-asana';
import { logError as logErrorOrig } from './error';

// As of 4.4.4, TypeScript's control flow analysis is wonky with
// narrowing and functions that return never.  This is a workaround:
//
// https://github.com/microsoft/TypeScript/issues/36753
const logError: (err: string) => never = logErrorOrig;

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
    logError(`Problem getting suggestions for ${text}: ${err}`);
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
    logError(`Failed to process ${inputData}: ${err}`);
  }
};

// This event is fired with the user accepts the input in the omnibox.
chrome.omnibox.onInputEntered.addListener(omniboxInputEnteredListener);
