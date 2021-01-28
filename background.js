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

const passOnTypeaheadResultToOmnibox = (suggest) => (typeaheadResult) => {
  // TODO: why not stream like above?
  const suggestions = typeaheadResult.data.map((task) => ({
    content: task.gid,
    description: task.name,
  }));
  console.log(`suggestions: ${suggestions}`);
  suggest(suggestions);
};

// This event is fired each time the user updates the text in the omnibox,
// as long as the extension's keyword mode is still active.
chrome.omnibox.onInputChanged.addListener(
  (text, suggest) => {
    const query = {
      resource_type: 'task',
      query: text,
      opt_pretty: true,
    };
    console.log('requesting typeahead with workspaceGid', workspaceGid,
      ' and query of ', query);
    client.typeahead.typeaheadForWorkspace(workspaceGid, query)
      .then(passOnTypeaheadResultToOmnibox(suggest));
  }
);

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

const omniboxInputListener = (taskGid) => {
  client.tasks.getTask(taskGid)
    .then(upvoteTaskFn(taskGid))
    .then(logSuccess);
};

// This event is fired with the user accepts the input in the omnibox.
chrome.omnibox.onInputEntered.addListener(omniboxInputListener);
