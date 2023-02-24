import { ChromeExtensionFormatter } from './chrome-extension-formatter.js';

test('new class', async () => {
  expect(new ChromeExtensionFormatter()).not.toBeNull();
});
