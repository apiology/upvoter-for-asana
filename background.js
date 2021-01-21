// https://github.com/GoogleChrome/chrome-extensions-samples/blob/1d8d137d20fad5972292377dc22498529d2a4039/api/omnibox/simple-example/background.js

'use strict';

// This event is fired each time the user updates the text in the omnibox,
// as long as the extension's keyword mode is still active.
chrome.omnibox.onInputChanged.addListener(
  function(text, suggest) {
    // console.log('asanaAccessToken: ' + asanaAccessToken);
    console.log('inputChanged: ' + text);
    console.log('Asana: ' + Asana);
    const client = Asana.Client.create().useAccessToken(asanaAccessToken);
    client.users.me().then(function(me) { console.log(me); });
    // console.log('Asana.Client: ' + Asana.Client);
//    console.log('asana: ' + asana);
//    console.log('Client: ' + Client);
    suggest([
      {content: text + " one", description: "the first one"},
      {content: text + " number two", description: "the second entry"}
    ]);
  });

// This event is fired with the user accepts the input in the omnibox.
chrome.omnibox.onInputEntered.addListener(
  function(text) {
    console.log('inputEntered: ' + text);
    alert('You just typed "' + text + '"');
  });
});
