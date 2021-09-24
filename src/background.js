const _ = require('lodash');

const { pullSuggestions, actOnInputData } = require('./upvoter_for_asana');

const logError = (err) => {
  alert(err);
  throw err;
};

const logSuccess = (result) => console.log('Acted:', result);

let omniboxInputChangedListenerDebounced = null;

const setSuggestionsFn = (suggest) => (suggestions) => {
  suggest(suggestions);
  chrome.omnibox.setDefaultSuggestion({
    description: '<dim>Results:</dim>',
  });
};

const omniboxInputChangedListener = (text, suggest) => {
  pullSuggestions(text)
    .then(setSuggestionsFn(suggest))
    .catch(logError);
};

omniboxInputChangedListenerDebounced = _.debounce(omniboxInputChangedListener, 500);

// This event is fired each time the user updates the text in the omnibox,
// as long as the extension's keyword mode is still active.
chrome.omnibox.onInputChanged.addListener(omniboxInputChangedListenerDebounced);

//
// Process when the user selects one of our options
//

const omniboxInputEnteredListener = (inputData) => {
  actOnInputData(inputData)
    .then(logSuccess)
    .catch(logError);
};

// This event is fired with the user accepts the input in the omnibox.
chrome.omnibox.onInputEntered.addListener(omniboxInputEnteredListener);
