export class ChromeExtensionLogger {
  log = console.log;

  debug = console.debug;

  warn = console.warn;

  error = console.error;

  userVisibleStatus = (message: string): void => {
    chrome.omnibox.setDefaultSuggestion({
      description: `<dim>${message}</dim>`,
    });
  };
}
