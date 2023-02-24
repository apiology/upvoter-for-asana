import { chrome } from 'jest-chrome';
import { setPlatform } from '../platform.js';
import { TestPlatform } from '../__mocks__/test-platform.js';
import { registerEventListeners } from './background.js';
import { omniboxInputChangedListener, omniboxInputEnteredListener } from './omnibox.js';

jest.mock('./omnibox');

test('registerEventListeners', async () => {
  jest.mocked(omniboxInputChangedListener);

  jest.mocked(omniboxInputEnteredListener);

  setPlatform(new TestPlatform());

  registerEventListeners();

  chrome.omnibox.onInputChanged.callListeners('foo', () => undefined);

  expect(omniboxInputChangedListener).toHaveBeenCalled();

  chrome.omnibox.onInputEntered.callListeners('foo', 'currentTab');

  expect(omniboxInputEnteredListener).toHaveBeenCalled();
});
