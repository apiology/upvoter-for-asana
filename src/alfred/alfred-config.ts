import { isString } from '../types.js';
import { Config } from '../config.js';

/* eslint-disable @typescript-eslint/no-unused-vars */
const fetchConfigString = (envVarName: string) => {
  const value = process.env[envVarName];
  if (value == null || !isString(value)) {
    throw new Error(`Configure ${envVarName} in Alfred env vars`);
  }
  return value;
};

const fetchNonEmptyConfigString = (envVarName: string) => {
  const value = fetchConfigString(envVarName);
  if (value.length === 0) {
    throw new Error(`Configure ${envVarName} in Alfred env vars`);
  }
  return value;
};

const fetchConfigBoolean = (envVarName: string): boolean => {
  const validValues: { [index: string]: boolean } = {
    true: true,
    false: false,
    yes: true,
    no: false,
    y: true,
    n: false,
    t: true,
    f: false,
  };
  const asString = fetchNonEmptyConfigString(envVarName);
  const value = validValues[asString.toLowerCase()];
  if (value == null) {
    throw new Error(`Configure ${envVarName} in Alfred env vars - must be "true" or "false"`);
  }
  return value;
};

const fetchConfigInteger = (envVarName: string): number => {
  const asString = fetchNonEmptyConfigString(envVarName);
  const value = Number(asString);
  if (Number.isNaN(value)) {
    throw new Error(`Configure ${envVarName} in Alfred env vars - must be valid number`);
  }
  if (!Number.isInteger(value)) {
    throw new Error(`Configure ${envVarName} in Alfred env vars - must be valid integer`);
  }
  return value;
};
/* eslint-enable @typescript-eslint/no-unused-vars */

export class AlfredConfig extends Config {
  fetchAsanaAccessToken = async () => fetchNonEmptyConfigString('asana_access_key');

  fetchWorkspaceName = async (): Promise<string> => fetchNonEmptyConfigString('workspace_name');

// fetchSomeConfigItem = async (): Promise<string> =>
  //   fetchNonEmptyConfigString('some_config_item');
}
