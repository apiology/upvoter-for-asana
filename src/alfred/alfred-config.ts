import { isString } from '../types.js';

/* eslint-disable @typescript-eslint/no-unused-vars */
const fetchConfigString = (envVarName: string) => {
  const value = process.env[envVarName];
  if (value == null || !isString(value)) {
    throw Error(`Configure ${envVarName} in Alfred env vars`);
  }
  return value;
};

const fetchNonEmptyConfigString = (envVarName: string) => {
  const value = fetchConfigString(envVarName);
  if (value.length === 0) {
    throw Error(`Configure ${envVarName} in Alfred env vars`);
  }
  return value;
};
/* eslint-enable @typescript-eslint/no-unused-vars */

export default class AlfredConfig {
  fetchAsanaAccessToken = async () => fetchNonEmptyConfigString('asana_access_key');

  fetchWorkspaceName = async (): Promise<string> => fetchNonEmptyConfigString('workspace_name');

// fetchSomeConfigItem = async (): Promise<string> =>
  //   fetchNonEmptyConfigString('some_config_item');
}
