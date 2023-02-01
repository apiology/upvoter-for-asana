import { TestLogger } from './test-logger.js';

export class TestPlatform {
  logger = () => new TestLogger();

  formatter = () => { throw new Error('not implemented'); };
}
