/**
 * @jest-environment jsdom
 */

import { readFile } from 'node:fs/promises';
import { chrome } from 'jest-chrome';
import { restoreOptions, saveOptions } from './options.js';
// we will assume these are tested well by dom-utils.test.js and feel free to use them here
import { htmlElementById } from './dom-utils.js';

beforeEach(async () => {
  document.body.innerHTML = await readFile(
    'static/chrome-extension/options.html',
    { encoding: 'utf-8' }
  );
  jest.useFakeTimers();
});

afterEach(() => {
  document.body.innerHTML = '';
  jest.useRealTimers();
});

test('saveOptionsSendsValueToChromeStorage', async () => {
  const token = htmlElementById('token', HTMLInputElement);

  token.value = 'my_token';

  const fakeChromeStorageSyncSet = (items: { [key: string]: object; }): void => {
    expect(items['asanaAccessToken']).toBe('my_token');
  };

  chrome.storage.sync.set.mockImplementation(fakeChromeStorageSyncSet);

  saveOptions();
});

function alwaysDefined<T>(arg: T | null | undefined): T {
  if (arg === undefined) {
    throw new Error('Did not expect this to be undefined!');
  } else if (arg == null) {
    throw new Error('Did not expect this to be null!');
  } else {
    return arg;
  }
}

test('saveOptionsUpdatesStatusOnSuccess', async () => {
  const fakeChromeStorageSyncSet = (
    items: { [key: string]: object; },
    callback?: () => void
  ): void => {
    expect(callback).toBeDefined();
    alwaysDefined(callback)();
  };

  chrome.storage.sync.set.mockImplementation(fakeChromeStorageSyncSet);

  saveOptions();
  expect(document.getElementById('status')?.textContent).toBe('Options saved.');
  // should disappear after a while
  jest.runAllTimers();
  expect(document.getElementById('status')?.textContent).toBe('');
});

test('restoreOptions', async () => {
  const fakeChromeStorageSyncGet = (
    keys: string | string[] | { [key: string]: object } | null,
    callback: (items: { [key: string]: object | string | undefined }) => void
  ): void => {
    if (Array.isArray(keys)) {
      fail('Did not expect this to be array!');
    }
    if (typeof keys === 'string' || keys instanceof String) {
      fail('Did not expect this to be string!');
    }
    // let's pretend asanaAccessToken was not yet set, but workspace was
    callback({ asanaAccessToken: alwaysDefined(keys)['asanaAccessToken'], workspace: 'my_workspace' });
  };

  chrome.storage.sync.get.mockImplementation(fakeChromeStorageSyncGet);

  restoreOptions();

  expect(htmlElementById('token', HTMLInputElement).value).toBe('');
  expect(htmlElementById('workspace', HTMLInputElement).value).toBe('my_workspace');
});
