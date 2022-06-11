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
    throw Error(`Configure ${envVarName} in Alfred env vars - must be "true" or "false"`);
  }
  return value;
};

const fetchConfigInteger = (envVarName: string): number => {
  const asString = fetchNonEmptyConfigString(envVarName);
  const value = Number(asString);
  if (Number.isNaN(value)) {
    throw Error(`Configure ${envVarName} in Alfred env vars - must be valid number`);
  }
  if (!Number.isInteger(value)) {
    throw Error(`Configure ${envVarName} in Alfred env vars - must be valid integer`);
  }
  return value;
};
/* eslint-enable @typescript-eslint/no-unused-vars */

export default class AlfredConfig {
  fetchAsanaAccessToken = async () => fetchNonEmptyConfigString('asana_access_key');

  fetchWorkspaceName = async (): Promise<string> => fetchNonEmptyConfigString('workspace_name');

  fetchCustomFieldName = async (): Promise<string> => fetchNonEmptyConfigString('custom_field_name');

  fetchIncrement = async (): Promise<boolean> => fetchConfigBoolean('increment');

  fetchManualIncrementAmount = async (): Promise<number> => fetchConfigInteger('increment_amount');
}
