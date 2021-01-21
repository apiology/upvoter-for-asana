# Upvoter for Asana

WARNING: This is not ready for use yet!

Quickly increment integer custom fields in Asana tasks from the Chrome Omnibox

## Usage

1. Download the node-asana library

   ```sh
   wget https://github.com/Asana/node-asana/releases/download/v0.18.4/asana.js
   ```

2. Create a config.js with a variable named 'asanaAccessToken' with a
   new
   [Asana Personal Access Token](https://app.asana.com/0/developer-console)
   assigned to it.
3. Add the name of your Asana workspace to config.js under the name 'workspaceName'
4. Add the name of the custom field you want to increment to config.js
   under the name 'customFieldName'
5. Go to chrome://extensions/
6. Click the 'Load unpacked' button.
7. Choose the directory containing your Chrome extension code.
8. Now you can work on your extension.
