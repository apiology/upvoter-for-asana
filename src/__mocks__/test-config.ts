import { Config } from '../config.js';

export class TestConfig extends Config {
  fetchAsanaAccessToken = async () => { throw new Error('not implemented'); };

  fetchWorkspaceName = async () => { throw new Error('not implemented'); };
}
