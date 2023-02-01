// https://developer.chrome.com/docs/extensions/mv2/options/
import { htmlElementById } from './dom-utils.js';

const htmlInputElement = (id: string) => htmlElementById(id, HTMLInputElement);

const htmlDivElement = (id: string) => htmlElementById(id, HTMLDivElement);

const statusElement = () => htmlDivElement('status');

const tokenElement = () => htmlInputElement('token');

const workspaceElement = () => htmlInputElement('workspace');

// const example = () => htmlInputElement('example');

const saveElement = () => htmlElementById('save', HTMLButtonElement);

// Saves options to chrome.storage
export function saveOptions() {
  const asanaAccessToken = tokenElement().value;
  const workspace = workspaceElement().value;
  // const example = exampleElement().value;
  chrome.storage.sync.set({
    asanaAccessToken,
    workspace,
    // example,
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
    // example: 'example default value',
  }, (items) => {
    tokenElement().value = items['asanaAccessToken'];
    workspaceElement().value = items['workspace'];
    // exampleElement().value = items.example;
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
