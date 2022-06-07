/**
 * upvoter-for-asana module.
 *
 * Chrome extension which quickly finds and increments integer custom fields in Asana tasks from the Chrome Omnibox.
 */

import { escapeHTML } from './omnibox.js';

export const logSuccess = (result: string | object): void => console.log('Upvoted task:', result);

export const pullOmniboxSuggestions = async (text: string) => [{
  content: `some input data for next step, maybe containing ${text}`,
  description: escapeHTML('some human readable text'),
}];

export const actOnInputData = async (text: string) => {
  console.log(`Acting upon ${text}`);
  return 'a success message or status';
};
