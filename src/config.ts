import { chromeStorageSyncFetch } from './storage';
import { logError } from './error';

export const fetchAsanaAccessToken = async () => {
  const token = await chromeStorageSyncFetch('asanaAccessToken');
  if (token == null) {
    chrome.runtime.openOptionsPage();
    logError('Please configure Asana access token');
  }
  return token;
};

export const workspaceName = 'VB';

export const customFieldName = 'upvotes';

export const increment = false;
