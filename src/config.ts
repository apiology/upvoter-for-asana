import { chromeStorageSyncFetch } from './storage';
import { logError } from './error';

export const fetchConfig = async (key: string, name: string) => {
  const value = await chromeStorageSyncFetch(key);
  if (value == null) {
    chrome.runtime.openOptionsPage();
    logError(`Please configure ${name}`);
  }
  return value;
};

export const fetchAsanaAccessToken = async () => fetchConfig('asanaAccessToken', 'Asana access token');

export const fetchWorkspaceName = async () => fetchConfig('workspace', 'workspace name');

export const fetchCustomFieldName = async () => fetchConfig('customField', 'custom field name');

export const fetchIncrement = async () => fetchConfig('increment', 'increment behavior');
