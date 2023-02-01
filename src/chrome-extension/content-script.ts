import { /* platform, */setPlatform } from '../platform.js';
import { ChromeExtensionPlatform } from './chrome-extension-platform.js';
// import { someTriggerFunction } from '../upvoter-for-asana.js';

export function registerEventListeners() {
  // const logger = platform().logger();
  // document.addEventListener('keydown', someTriggerFunction, { capture: true });
  // logger.debug('Registered keydown listener', someTriggerFunction);
}

/* istanbul ignore next */
if (typeof jest === 'undefined') {
  const p = new ChromeExtensionPlatform();
  setPlatform(p);
  registerEventListeners();
}
