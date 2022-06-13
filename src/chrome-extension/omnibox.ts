/**
 * omnibox module.
 *
 * Contains functions useful to interact with chrome.omnibox API
 */

import * as _ from 'lodash';
import {
  pullSuggestions, Suggestion, actOnInputData, logSuccess,
} from '../upvoter-for-asana.js';

const pullOmniboxSuggestions = async (text: string) => {
  const suggestions = await pullSuggestions(text);
  return suggestions.map((suggestion: Suggestion) => ({
    content: suggestion.url,
    description: suggestion.description,
  }));
};

type SuggestFunction = (suggestResults: chrome.omnibox.SuggestResult[]) => void;

const populateOmnibox = async (text: string, suggest: SuggestFunction) => {
  const suggestions = await pullOmniboxSuggestions(text);

  if (suggestions.length <= 0) {
    chrome.omnibox.setDefaultSuggestion({
      description: 'No results found',
    });

    return;
  }

  chrome.omnibox.setDefaultSuggestion({
    description: suggestions[0].description,
  });
  suggest(suggestions.slice(1, -1));
  console.log(`${suggestions.length} suggestions from ${text}: `, suggestions);
};

const pullAndReportSuggestions = async (text: string, suggest: SuggestFunction) => {
  try {
    await populateOmnibox(text, suggest);
  } catch (err) {
    alert(`Problem getting suggestions for ${text}: ${err}`);
    throw err;
  }
};

export const omniboxInputChangedListener = _.debounce(pullAndReportSuggestions, 500);

export const omniboxInputEnteredListener = async (inputData: string) => {
  try {
    let urlText = inputData;
    if (!inputData.startsWith('upvoter-for-asana:')) {
      // all we got was the default suggestion, so we have to do search
      // again
      const suggestions = await pullSuggestions(inputData);
      if (suggestions.length === 0) {
        throw new Error(`No results for "${inputData}"`);
      }
      urlText = suggestions[0].url;
    }
    const out = await actOnInputData(urlText);
    logSuccess(out);
  } catch (err) {
    alert(`Failed to process ${inputData}: ${err}`);
    throw err;
  }
};
