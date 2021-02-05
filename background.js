'use strict';

// https://github.com/GoogleChrome/chrome-extensions-samples/blob/1d8d137d20fad5972292377dc22498529d2a4039/api/omnibox/simple-example/background.js

const client = Asana.Client.create().useAccessToken(asanaAccessToken);

let workspaceGid = null;

let customFieldGid = null;

const saveCustomFieldGidIfRightName = (customField) => {
  if (customField.name === customFieldName) {
    customFieldGid = customField.gid;
    console.log(`Found custom field GID as ${customFieldGid}`);
  }
};

const findAndSaveCustomFieldGid = (customFieldsResult) => {
  customFieldsResult.stream().on('data', saveCustomFieldGidIfRightName);
};

const saveWorkspaceAndCustomFieldGidsIfRightNames = (workspace) => {
  if (workspace.name === workspaceName) {
    workspaceGid = workspace.gid;
    console.log(`Found workspace GID as ${workspaceGid}`);
    client.customFields.getCustomFieldsForWorkspace(workspaceGid, {})
      .then(findAndSaveCustomFieldGid);
  }
};

const findAndSaveWorkspaceAndCustomFieldGids = (workspacesResult) => {
  workspacesResult.stream().on('data', saveWorkspaceAndCustomFieldGidsIfRightNames);
};

client.workspaces.getWorkspaces().then(findAndSaveWorkspaceAndCustomFieldGids);

// How on God's green earth is there no built-in function to do this?
//
// https://stackoverflow.com/questions/40263803/native-javascript-or-es6-way-to-encode-and-decode-html-entities
const escapeHTML = (str) => str.replace(/[&<>'"]/g,
  (tag) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[tag]));

const passOnTypeaheadResultToOmnibox = ({ suggest, typeaheadResult }) => {
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
};

class NotInitializedError extends Error {}

const pullTypeaheadSuggestions = (text, suggest) => {
  const query = {
    resource_type: 'task',
    query: text,
    opt_pretty: true,
    opt_fields: ['name', 'completed', 'parent', 'custom_fields.gid'],
  };
  if (workspaceGid == null) {
    throw new NotInitializedError();
  }

  console.log('requesting typeahead with workspaceGid', workspaceGid,
    ' and query of ', query);
  // https://developers.asana.com/docs/typeahead
  return client.typeahead.typeaheadForWorkspace(workspaceGid, query)
    .then((typeaheadResult) => ({ suggest, typeaheadResult }));
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

const upvoteTaskFn = (taskGid) => (task) => {
  console.log('upvoteTaskFn got task', task);
  const customField = task.custom_fields.find((field) => field.gid === customFieldGid);
  console.log('Custom field: ', customField);
  console.log('Custom field number value: ', customField.number_value);
  const currentValue = customField.number_value;
  // https://developers.asana.com/docs/update-a-task
  const newValue = increment ? currentValue + 1 : currentValue - 1;
  const updatedCustomFields = {};
  updatedCustomFields[customFieldGid] = newValue;
  return client.tasks.updateTask(taskGid,
    { custom_fields: updatedCustomFields })
    .then((result) => ({ result, task, newValue }));
};

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
