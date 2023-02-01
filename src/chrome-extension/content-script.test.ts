/**
 * @jest-environment jsdom
 */

// import { someTriggerFunction } from '../upvoter-for-asana.js';
// import { registerEventListeners } from './content-script.js';
// import { setPlatform } from '../platform.js';
// import { TestPlatform } from '../__mocks__/test-platform.js';

jest.mock('../upvoter-for-asana');

test('dummyTest', () => undefined);

// test('registerEventListeners', async () => {
//   // jest.mocked(shortcutsKeyDownBeforeOthers);

//   setPlatform(new TestPlatform());

//   registerEventListeners();

//   // document.dispatchEvent(new window.KeyboardEvent('keydown'));

//   // expect(someTriggerFunction).toHaveBeenCalled();
// });
