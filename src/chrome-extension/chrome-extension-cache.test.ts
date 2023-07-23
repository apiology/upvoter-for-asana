import { chrome } from 'jest-chrome';
import { ChromeExtensionCache } from './chrome-extension-cache.js';

test('create class', () => {
  expect(new ChromeExtensionCache()).not.toBeNull();
});

test('chromeStorageSyncFetch', async () => {
  const fakeChromeStorageSyncGet = (
    keys: string | string[] | { [key: string]: object } | null,
    callback: (items: { [key: string]: object | string }) => void
  ): void => {
    expect(keys).toEqual(['asanaAccessToken']);
    callback({ asanaAccessToken: '123' });
  };

  chrome.storage.sync.get.mockImplementation(fakeChromeStorageSyncGet);

  const cache = new ChromeExtensionCache();
  expect(await cache.cacheFetch('asanaAccessToken', 'string')).toEqual('123');
});
