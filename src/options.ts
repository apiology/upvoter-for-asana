// https://developer.chrome.com/docs/extensions/mv2/options/

import { logError } from './error';

const incrementElement = () => {
  const element = document.getElementById('increment');
  if (element == null) {
    logError("Couldn't find incrementElement");
  }
  if (!(element instanceof HTMLInputElement)) {
    logError('incrementElement not as expected!');
  }
  return element;
};

const tokenElement = () => {
  const element = document.getElementById('token');
  if (element == null) {
    logError("Couldn't find token element");
  }
  if (!(element instanceof HTMLInputElement)) {
    logError('token element not as expected!');
  }
  return element;
};

const workspaceElement = () => {
  const element = document.getElementById('workspace');
  if (element == null) {
    logError("Couldn't find workspace element");
  }
  if (!(element instanceof HTMLInputElement)) {
    logError('workspace element not as expected!');
  }
  return element;
};

const customFieldElement = () => {
  const element = document.getElementById('customField');
  if (element == null) {
    logError("Couldn't find customField element");
  }
  if (!(element instanceof HTMLInputElement)) {
    logError('customField element not as expected!');
  }
  return element;
};

const statusElement = () => {
  const element = document.getElementById('status');
  if (element == null) {
    logError("Couldn't find statusElement");
  }
  if (!(element instanceof HTMLDivElement)) {
    logError('statusElement not as expected!');
  }
  return element;
};

const saveElement = () => {
  const element = document.getElementById('save');
  if (element == null) {
    logError("Couldn't find saveElement");
  }
  return element;
};

// Saves options to chrome.storage
const saveOptions = () => {
  const asanaAccessToken = tokenElement().value;
  const workspace = workspaceElement().value;
  const customField = customFieldElement().value;
  const increment = incrementElement().checked;
  chrome.storage.sync.set({
    asanaAccessToken,
    workspace,
    customField,
    increment,
  }, () => {
    // Update status to let user know options were saved.
    statusElement().textContent = 'Options saved.';
    setTimeout(() => {
      statusElement().textContent = '';
    }, 750);
  });
};

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
const restoreOptions = () => {
  chrome.storage.sync.get({
    asanaAccessToken: null,
    workspace: null,
    customField: 'votes',
    increment: true,
  }, (items) => {
    tokenElement().value = items.asanaAccessToken;
    workspaceElement().value = items.workspace;
    customFieldElement().value = items.customField;
    incrementElement().checked = items.increment;
  });
};

document.addEventListener('DOMContentLoaded', restoreOptions);
saveElement().addEventListener('click', saveOptions);
