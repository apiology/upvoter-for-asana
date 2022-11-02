import ChromeExtensionLogger from './chrome-extension-logger.js';

test('log', async () => {
  expect(new ChromeExtensionLogger().log).toBe(console.log);
});

test('debug', async () => {
  expect(new ChromeExtensionLogger().debug).toBe(console.debug);
});

test('warn', async () => {
  expect(new ChromeExtensionLogger().warn).toBe(console.warn);
});

test('error', async () => {
  expect(new ChromeExtensionLogger().error).toBe(console.error);
});
