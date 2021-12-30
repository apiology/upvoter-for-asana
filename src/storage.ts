export const chromeStorageSyncFetch = (key: string):
  Promise<string | null> => new Promise<string | null>((resolve) => {
    chrome.storage.sync.get([key], (result) => {
      const output = result[key];
      resolve(output);
    });
  });

export const chromeStorageSyncStore = (key: string, value: string) => {
  const settings: { [index: string]: string } = {};
  settings[key] = value;
  chrome.storage.sync.set(settings);
};
