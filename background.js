// https://github.com/GoogleChrome/chrome-extensions-samples/blob/1d8d137d20fad5972292377dc22498529d2a4039/api/omnibox/simple-example/background.js

'use strict';

const client = Asana.Client.create().useAccessToken(asanaAccessToken);

var workspaceGid = null;

client.workspaces.getWorkspaces()
  .then((result) => {
    result.stream().on('data', workspace => {
      if (workspace.name == workspaceName) {
        workspaceGid = workspace.gid
        console.log("Found workspace GID as " + workspaceGid);
      }
    })});



// This event is fired each time the user updates the text in the omnibox,
// as long as the extension's keyword mode is still active.
chrome.omnibox.onInputChanged.addListener(
  function(text, suggest) {

    client.typeahead.typeaheadForWorkspace(workspaceGid,
                                           {"resource_type": "task",
                                            "query": text, opt_pretty: true})
      .then((result) => {
        let suggestions = result.data.map(task => ({content: task.gid, description: task.name}));
        console.log('suggestions: ' + suggestions);
        suggest(suggestions);
      });
  });

// This event is fired with the user accepts the input in the omnibox.
chrome.omnibox.onInputEntered.addListener(
  function(text) {
    console.log('inputEntered: ' + text);
    alert('You just typed "' + text + '"');
  });
