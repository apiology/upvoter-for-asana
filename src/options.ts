// https://developer.chrome.com/docs/extensions/mv2/options/

// https://2ality.com/2020/04/classes-as-values-typescript.html
/* eslint-disable @typescript-eslint/no-explicit-any */
type Class<T> = new (...args: any[]) => T;
/* eslint-enable @typescript-eslint/no-explicit-any */

const htmlElement = <T extends HTMLElement>(id: string, clazz: Class<T>): T => {
  const element = document.getElementById(id);
  if (element == null) {
    throw new Error(`Couldn't find element with id ${id}`);
  }
  if (!(element instanceof clazz)) {
    throw new Error(`element with id ${id} not an ${clazz.name} as expected!`);
  }
  return element;
};

const htmlInputElement = (id: string) => htmlElement(id, HTMLInputElement);

const htmlDivElement = (id: string) => htmlElement(id, HTMLDivElement);

const statusElement = () => htmlDivElement('status');

const incrementElement = () => htmlInputElement('increment');

const tokenElement = () => htmlInputElement('token');

const workspaceElement = () => htmlInputElement('workspace');

const customFieldElement = () => htmlInputElement('customField');

const omniboxIncrementAmountElement = () => htmlInputElement('omniboxIncrementAmount');

const saveElement = () => htmlElement('save', HTMLButtonElement);

const ensureInt = (s: string): number => {
  const parsed = Number.parseInt(s, 10);
  if (Number.isNaN(parsed)) {
    throw new Error('Got non-integer parsed from HTML form');
  }
  return parsed;
};

// Saves options to chrome.storage
const saveOptions = () => {
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
};

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
const restoreOptions = () => {
  chrome.storage.sync.get({
    asanaAccessToken: null,
    workspace: null,
    customField: 'votes',
    increment: true,
    omniboxIncrementAmount: 1,
  }, (items) => {
    tokenElement().value = items.asanaAccessToken;
    workspaceElement().value = items.workspace;
    customFieldElement().value = items.customField;
    incrementElement().checked = items.increment;
    omniboxIncrementAmountElement().value = items.omniboxIncrementAmount;
  });
};

document.addEventListener('DOMContentLoaded', restoreOptions);
saveElement().addEventListener('click', saveOptions);
