/**
 * background module.
 *
 * Registers listeners with chrome.omnibox API.  Initialized when
 * browser extension is loaded.
 */

// https://github.com/GoogleChrome/chrome-extensions-samples/blob/1d8d137d20fad5972292377dc22498529d2a4039/api/omnibox/simple-example/background.js

import { setPlatform } from '../platform.js';
import { ChromeExtensionPlatform } from './chrome-extension-platform.js';
import { omniboxInputChangedListener, omniboxInputEnteredListener } from './omnibox.js';

export function registerEventListeners() {
  // This event is fired each time the user updates the text in the omnibox,
  // as long as the extension's keyword mode is still active.
  chrome.omnibox.onInputChanged.addListener(omniboxInputChangedListener);

  // This event is fired with the user accepts the input in the omnibox.
  chrome.omnibox.onInputEntered.addListener(omniboxInputEnteredListener);
}

/* istanbul ignore next */
if (typeof jest === 'undefined') {
  setPlatform(new ChromeExtensionPlatform());
  registerEventListeners();
}
