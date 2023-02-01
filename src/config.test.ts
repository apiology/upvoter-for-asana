import { Config } from './config.js';

class ConfigSpy extends Config {
fetchAsanaAccessTokenCalled: boolean

  fetchWorkspaceNameCalled: boolean

  fetchVldApiKeyCalled: boolean

  constructor() {
    super();
    this.fetchAsanaAccessTokenCalled = false;
    this.fetchWorkspaceNameCalled = false;
    this.fetchVldApiKeyCalled = false;
  }

  fetchAsanaAccessToken(): Promise<string> {
    this.fetchAsanaAccessTokenCalled = true;
    return new Promise<string>((resolve) => resolve('foo'));
  }

  fetchWorkspaceName(): Promise<string> {
    this.fetchWorkspaceNameCalled = true;
    return new Promise<string>((resolve) => resolve('foo'));
  }

  fetchVldApiKey(): Promise<string> {
    this.fetchVldApiKeyCalled = true;
    return new Promise<string>((resolve) => resolve('foo'));
  }
}

test('Config#validate', async () => {
  const config = new ConfigSpy();
  await config.validate();
  expect(config.fetchAsanaAccessTokenCalled).toBeTruthy();
  expect(config.fetchWorkspaceName).toBeTruthy();
  expect(config.fetchVldApiKey).toBeTruthy();
});
