export default class ChromeExtensionLogger {
  log = console.log;

  debug = console.debug;

  userVisibleStatus = (message: string): void => {
    chrome.omnibox.setDefaultSuggestion({
      description: `<dim>${message}</dim>`,
    });
  };
}
