import { chrome } from 'jest-chrome';
import { setPlatform } from './platform.js';
import { TestPlatform } from './__mocks__/test-platform.js';
import { doWork } from './upvoter-for-asana.js';

test('doWork', async () => {
  setPlatform(new TestPlatform());

  doWork({} as chrome.tabs.Tab);

  expect(chrome.tabs.executeScript).toBeCalled();
});
