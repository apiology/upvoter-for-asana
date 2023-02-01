// https://developer.chrome.com/docs/extensions/mv2/options/
import { htmlElementById } from './dom-utils.js';

const htmlInputElement = (id: string) => htmlElementById(id, HTMLInputElement);

const htmlDivElement = (id: string) => htmlElementById(id, HTMLDivElement);

const statusElement = () => htmlDivElement('status');

const incrementElement = () => htmlInputElement('increment');

const tokenElement = () => htmlInputElement('token');

const workspaceElement = () => htmlInputElement('workspace');

const customFieldElement = () => htmlInputElement('customField');

const omniboxIncrementAmountElement = () => htmlInputElement('omniboxIncrementAmount');

const saveElement = () => htmlElementById('save', HTMLButtonElement);

const ensureInt = (s: string): number => {
  const parsed = Number.parseInt(s, 10);
  if (Number.isNaN(parsed)) {
    throw new Error(`Got non-integer parsed from HTML form: ${parsed}`);
  }
  return parsed;
};

// Saves options to chrome.storage
export function saveOptions() {
  const asanaAccessToken = tokenElement().value;
  const workspace = workspaceElement().value;
  const customField = customFieldElement().value;
  const omniboxIncrementAmount: number = ensureInt(omniboxIncrementAmountElement().value);
  const increment = incrementElement().checked;
  chrome.storage.sync.set({
    asanaAccessToken,
    workspace,
    customField,
    increment,
    omniboxIncrementAmount,
  }, () => {
    // Update status to let user know options were saved.
    statusElement().textContent = 'Options saved.';
    setTimeout(() => {
      statusElement().textContent = '';
    }, 750);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
export function restoreOptions() {
  chrome.storage.sync.get({
    asanaAccessToken: null,
    workspace: null,
    customField: 'votes',
    increment: true,
    omniboxIncrementAmount: 1,
  }, (items) => {
    tokenElement().value = items['asanaAccessToken'];
    workspaceElement().value = items['workspace'];
    customFieldElement().value = items['customField'];
    incrementElement().checked = items['increment'];
    omniboxIncrementAmountElement().value = items['omniboxIncrementAmount'];
  });
}

export function registerEventListeners() {
  document.addEventListener('DOMContentLoaded', restoreOptions);
  saveElement().addEventListener('click', saveOptions);
}

/* istanbul ignore next */
if (typeof jest === 'undefined') {
  registerEventListeners();
}
