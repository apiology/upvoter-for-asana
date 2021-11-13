import Asana from 'asana';

export const client = Asana.Client.create().useAccessToken(asanaAccessToken);

let workspaceGid = null;

let customFieldGid = null;

const saveCustomFieldGidIfRightName = (customField, resolve) => {
  if (customField.name === customFieldName) {
    customFieldGid = customField.gid;
    console.log(`Found custom field GID as ${customFieldGid}`);
    resolve();
  }
};

const findAndSaveCustomFieldGid = (customFieldsResult) => new Promise((resolve, reject) => {
  // https://stackoverflow.com/questions/44013020/using-promises-with-streams-in-node-js
  const stream = customFieldsResult.stream();
  stream.on('data', (customField) => saveCustomFieldGidIfRightName(customField, resolve));
  stream.on('end', () => resolve());
  stream.on('finish', () => resolve());
  stream.on('error', () => reject());
});

const saveWorkspaceAndCustomFieldGidsIfRightNames = (workspace, resolve) => {
  if (workspace.name === workspaceName) {
    workspaceGid = workspace.gid;
    console.log(`Found workspace GID as ${workspaceGid}`);
    resolve(client.customFields.getCustomFieldsForWorkspace(workspaceGid, {})
      .then(findAndSaveCustomFieldGid));
  }
};

const findAndSaveWorkspaceAndCustomFieldGids = (workspacesResult) => new Promise((resolve,
  reject) => {
  // https://stackoverflow.com/questions/44013020/using-promises-with-streams-in-node-js
  const stream = workspacesResult.stream();
  stream.on('data',
    (workspace) => saveWorkspaceAndCustomFieldGidsIfRightNames(workspace, resolve));
  stream.on('end', () => resolve());
  stream.on('finish', () => resolve());
  stream.on('error', () => reject());
});

export const gidFetch = client.workspaces.getWorkspaces()
  .then(findAndSaveWorkspaceAndCustomFieldGids);

export const pullCustomFieldGid = () => gidFetch.then(() => customFieldGid);

// How on God's green earth is there no built-in function to do this?
//
// https://stackoverflow.com/questions/40263803/native-javascript-or-es6-way-to-encode-and-decode-html-entities
export const escapeHTML = (str) => str.replace(/[&<>'"]/g,
  (tag) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[tag]));

class NotInitializedError extends Error {}

export const pullTypeaheadSuggestions = (text, suggest) => {
  const query = {
    resource_type: 'task',
    query: text,
    opt_pretty: true,
    opt_fields: ['name', 'completed', 'parent', 'custom_fields.gid', 'custom_fields.number_value'],
  };
  return gidFetch.then(() => {
    if (workspaceGid == null) {
      alert('NOT INITIALIZED!');
      throw new NotInitializedError();
    }

    console.log('requesting typeahead with workspaceGid', workspaceGid,
      ' and query of ', query);
    chrome.omnibox.setDefaultSuggestion({
      description: `<dim>Searching for ${text}...</dim>`,
    });

    // https://developers.asana.com/docs/typeahead
    return client.typeahead.typeaheadForWorkspace(workspaceGid, query)
      .then((typeaheadResult) => ({ suggest, typeaheadResult }));
  });
};

export const upvoteTask = (task) => {
  console.log('upvoteTask got task', task);
  return pullCustomFieldGid().then((upvotesCustomFieldGid) => {
    const customField = task.custom_fields.find((field) => field.gid === upvotesCustomFieldGid);
    const currentValue = customField.number_value;
    // https://developers.asana.com/docs/update-a-task
    const newValue = increment ? currentValue + 1 : currentValue - 1;
    const updatedCustomFields = {};
    updatedCustomFields[customFieldGid] = newValue;
    return client.tasks.updateTask(task.gid,
      { custom_fields: updatedCustomFields });
  });
};

export const logSuccess = (result) => console.log('Upvoted task:', result);

export const pullCustomFieldFn = (upvotesCustomFieldGid) => (task) => {
  const customField = task.custom_fields.find((field) => field.gid === upvotesCustomFieldGid);

  return { task, customField };
};
