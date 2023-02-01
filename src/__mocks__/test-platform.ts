import { TestConfig } from './test-config.js';
import { TestLogger } from './test-logger.js';

export class TestPlatform {
  config = () => new TestConfig();

  cache = () => { throw new Error('not implemented'); };

  logger = () => new TestLogger();

  formatter = () => { throw new Error('not implemented'); };
}
