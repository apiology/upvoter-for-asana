import { Config } from './config.js';

class ConfigSpy extends Config {
  fetchAsanaAccessTokenCalled: boolean;

  fetchWorkspaceNameCalled: boolean;

  fetchCustomFieldNameCalled: boolean;

  fetchIncrementCalled: boolean;

  fetchManualIncrementAmountCalled: boolean;

  constructor() {
    super();
    this.fetchAsanaAccessTokenCalled = false;
    this.fetchWorkspaceNameCalled = false;
    this.fetchCustomFieldNameCalled = false;
    this.fetchIncrementCalled = false;
    this.fetchManualIncrementAmountCalled = false;
  }

  fetchAsanaAccessToken(): Promise<string> {
    this.fetchAsanaAccessTokenCalled = true;
    return new Promise<string>((resolve) => {
      resolve('foo');
    });
  }

  fetchWorkspaceName(): Promise<string> {
    this.fetchWorkspaceNameCalled = true;
    return new Promise<string>((resolve) => {
      resolve('foo');
    });
  }

  fetchCustomFieldName(): Promise<string> {
    this.fetchCustomFieldNameCalled = true;
    return new Promise<string>((resolve) => {
      resolve('foo');
    });
  }

  fetchIncrement(): Promise<boolean> {
    this.fetchIncrementCalled = true;
    return new Promise<boolean>((resolve) => {
      resolve(true);
    });
  }

  fetchManualIncrementAmount(): Promise<number> {
    this.fetchManualIncrementAmountCalled = true;
    return new Promise<number>((resolve) => {
      resolve(5);
    });
  }
}

test('Config#validate', async () => {
  const config = new ConfigSpy();
  await config.validate();
  expect(config.fetchAsanaAccessTokenCalled).toBeTruthy();
  expect(config.fetchWorkspaceName).toBeTruthy();
});
