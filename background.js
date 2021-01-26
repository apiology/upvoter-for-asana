'use strict';

// https://github.com/GoogleChrome/chrome-extensions-samples/blob/1d8d137d20fad5972292377dc22498529d2a4039/api/omnibox/simple-example/background.js

const client = Asana.Client.create().useAccessToken(asanaAccessToken);

let workspaceGid = null;

let customFieldGid = null;

client.workspaces.getWorkspaces()
  .then((workspacesResult) => {
    workspacesResult.stream().on('data', (workspace) => {
      if (workspace.name === workspaceName) {
        workspaceGid = workspace.gid;
        console.log(`Found workspace GID as ${workspaceGid}`);
        client.customFields.getCustomFieldsForWorkspace(workspaceGid, {})
          .then((customFieldsResult) => {
            customFieldsResult.stream().on('data', (customField) => {
              if (customField.name === customFieldName) {
                customFieldGid = customField.gid;
                console.log(`Found custom field GID as ${customFieldGid}`);
              }
            });
          });
      }
    });
  });

// This event is fired each time the user updates the text in the omnibox,
// as long as the extension's keyword mode is still active.
chrome.omnibox.onInputChanged.addListener(
  (text, suggest) => {
    client.typeahead.typeaheadForWorkspace(workspaceGid,
      {
        resource_type: 'task',
        query: text,
        opt_pretty: true,
      })
      .then((result) => {
        const suggestions = result.data.map((task) => ({
          content: task.gid,
          description: task.name,
        }));
        console.log(`suggestions: ${suggestions}`);
        suggest(suggestions);
      });
  }
);

// This event is fired with the user accepts the input in the omnibox.
chrome.omnibox.onInputEntered.addListener(
  (taskGid) => {
    client.tasks.getTask(taskGid)
      .then((task) => {
        console.log(task);
        const customField = task.custom_fields.find((field) => field.gid === customFieldGid);
        console.log('Custom field: ', customField);
        console.log('Custom field number value: ', customField.number_value);
        const currentValue = customField.number_value;
        // https://developers.asana.com/docs/update-a-task
        const newValue = increment ? currentValue + 1 : currentValue - 1;
        const updatedCustomFields = {};
        updatedCustomFields[customFieldGid] = newValue;
        client.tasks.updateTask(taskGid, { custom_fields: updatedCustomFields })
          .then((result) => {
            console.log(result);
            alert(`Just upvoted "${task.name}" to ${newValue}`);
          });
        // return a non-undefined value to signal that we didn't
        // forget to return
        return null;
      });
  }
);
