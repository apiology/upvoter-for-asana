// https://developer.chrome.com/docs/extensions/mv2/options/

import { logError } from './error';

const colorElement = () => {
  const element = document.getElementById('color');
  if (element == null) {
    logError("Couldn't find colorElement");
  }
  if (!(element instanceof HTMLSelectElement)) {
    logError('colorElement not as expected!');
  }
  return element;
};

const likeElement = () => {
  const element = document.getElementById('like');
  if (element == null) {
    logError("Couldn't find likeElement");
  }
  if (!(element instanceof HTMLInputElement)) {
    logError('likeElement not as expected!');
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
  const color = colorElement().value;
  const likesColor = likeElement().checked;
  chrome.storage.sync.set({
    asanaAccessToken,
    favoriteColor: color,
    likesColor,
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
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.sync.get({
    asanaAccessToken: null,
    favoriteColor: 'red',
    likesColor: true,
  }, (items) => {
    tokenElement().value = items.asanaAccessToken;
    colorElement().value = items.favoriteColor;
    likeElement().checked = items.likesColor;
  });
};

document.addEventListener('DOMContentLoaded', restoreOptions);
saveElement().addEventListener('click', saveOptions);
