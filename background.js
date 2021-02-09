'use strict';

// https://github.com/GoogleChrome/chrome-extensions-samples/blob/1d8d137d20fad5972292377dc22498529d2a4039/api/omnibox/simple-example/background.js

const passOnTypeaheadResultToOmnibox = ({ suggest, typeaheadResult }) => {
  chrome.omnibox.setDefaultSuggestion({
    description: '<dim>Processing results...</dim>',
  });
  console.log('typeaheadResult: ', typeaheadResult);
  // TODO: why not stream like above?
  const suggestions = typeaheadResult.data
    .filter((task) => !task.completed)
    .filter((task) => task.parent == null)
    .filter((task) => task.name.length > 0)
    .filter((task) => task.custom_fields
      .map((customField) => customField.gid).includes(customFieldGid))
    .map((task) => ({
      content: task.gid,
      description: escapeHTML(task.name),
    }));
  console.log('suggestions:', suggestions);
  suggest(suggestions);
  chrome.omnibox.setDefaultSuggestion({
    description: '<dim>Results:</dim>',
  });
};

const logError = (err) => {
  alert(err);
  throw err;
};

const omniboxInputChangedListener = (text, suggest) => {
  pullTypeaheadSuggestions(text, suggest)
    .then(passOnTypeaheadResultToOmnibox)
    .catch(logError);
};

// This event is fired each time the user updates the text in the omnibox,
// as long as the extension's keyword mode is still active.
chrome.omnibox.onInputChanged.addListener(omniboxInputChangedListener);

const logSuccess = ({ result, task, newValue }) => {
  console.log(result);
  alert(`Just upvoted "${task.name}" to ${newValue}`);
};

const omniboxInputEnteredListener = (taskGid) => {
  client.tasks.getTask(taskGid)
    .then(upvoteTaskFn(taskGid))
    .then(logSuccess)
    .catch(logError);
};

// This event is fired with the user accepts the input in the omnibox.
chrome.omnibox.onInputEntered.addListener(omniboxInputEnteredListener);
