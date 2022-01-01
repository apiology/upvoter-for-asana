import { chromeStorageSyncFetch } from './storage';

// https://2ality.com/2020/04/classes-as-values-typescript.html
/* eslint-disable @typescript-eslint/no-explicit-any */
type Class<T> = new (...args: any[]) => T;
/* eslint-enable @typescript-eslint/no-explicit-any */

const ensureConfigNotNull = <T>(value: T | null, name: string): T => {
  if (value == null) {
    chrome.runtime.openOptionsPage();
    throw new Error(`Please configure ${name}`);
  }
  return value;
};

async function fetchConfig(key: string, name: string,
  clazz: 'string'): Promise<string>;
async function fetchConfig(key: string, name: string,
  clazz: 'boolean'): Promise<boolean>;
async function fetchConfig<T>(key: string, name: string,
  clazz: Class<T>): Promise<T>;
async function fetchConfig<T>(key: string, name: string,
  clazz: Class<T> | 'string' | 'boolean'): Promise<T | boolean | string> {
  if (clazz === 'string') {
    const value = await chromeStorageSyncFetch(key, clazz);
    return ensureConfigNotNull(value, name);
  }

  if (clazz === 'boolean') {
    const value = await chromeStorageSyncFetch(key, clazz);
    return ensureConfigNotNull(value, name);
  }

  const value = await chromeStorageSyncFetch(key, clazz);
  return ensureConfigNotNull(value, name);
}

export const fetchAsanaAccessToken = async () => fetchConfig('asanaAccessToken', 'Asana access token', 'string');

export const fetchWorkspaceName = async () => fetchConfig('workspace', 'workspace name', 'string');

export const fetchCustomFieldName = async () => fetchConfig('customField', 'custom field name', 'string');

export const fetchIncrement = async () => fetchConfig('increment', 'increment behavior', 'boolean');
