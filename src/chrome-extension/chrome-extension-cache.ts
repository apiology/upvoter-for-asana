// https://2ality.com/2020/04/classes-as-values-typescript.html
/* eslint-disable @typescript-eslint/no-explicit-any */
type Class<T> = new (...args: any[]) => T;

// https://stackoverflow.com/a/67850394/2625807
export function isString(value: any): value is string {
  return typeof value === 'string' || value instanceof String;
}

// https://stackoverflow.com/a/67850394/2625807
export function isBoolean(value: any): value is boolean {
  return typeof value === 'boolean' || value instanceof Boolean;
}

// https://stackoverflow.com/a/67850394/2625807
export function isNumber(value: any): value is number {
  return typeof value === 'number' || value instanceof Number;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export function chromeStorageSyncFetch(key: string,
  clazz: 'number'): Promise<number | null>;
export function chromeStorageSyncFetch(key: string,
  clazz: 'string'): Promise<string | null>;
export function chromeStorageSyncFetch(key: string,
  clazz: 'boolean'): Promise<boolean | null>;
export function chromeStorageSyncFetch<T>(key: string,
  clazz: Class<T>): Promise<T | null>;
export function chromeStorageSyncFetch<T>(key: string,
  clazz: Class<T> | 'number' | 'string' | 'boolean'):
  Promise<T | boolean | string | number | null> {
  return new Promise((resolve) => {
    chrome.storage.sync.get([key], (result) => {
      const output = result[key];
      if (output == null) {
        resolve(output);
      } else if (clazz === 'string') {
        if (isString(output)) {
          resolve(output);
        } else {
          throw new Error(`config stored in chrome.storage.sync as ${key} not a string as expected (${typeof output}): ${output}`);
        }
      } else if (clazz === 'boolean') {
        if (isBoolean(output)) {
          resolve(output);
        } else {
          throw new Error(`config stored in chrome.storage.sync as ${key} not a boolean as expected (${typeof output}): ${output}`);
        }
      } else if (clazz === 'number') {
        if (isNumber(output)) {
          resolve(output);
        } else {
          throw new Error(`config stored in chrome.storage.sync as ${key} not a number as expected (${typeof output}): ${output}`);
        }
      } else if (output instanceof clazz) {
        resolve(output);
      } else {
        throw new Error(`config stored in chrome.storage.sync as ${key} not an ${clazz.name} as expected (${typeof output}): ${output}`);
      }
    });
  });
}

export class ChromeExtensionCache {
  cacheFetch = async (key: string,
    clazz: 'string'): Promise<string | null> => chromeStorageSyncFetch(key, clazz);

  cacheStore = async (key: string, value: string): Promise<void> => {
    const settings: { [index: string]: string } = {};
    settings[key] = value;
    chrome.storage.sync.set(settings);
  }
}
