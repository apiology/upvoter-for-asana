import { AlfredCache } from './alfred-cache.js';
import { AlfredConfig } from './alfred-config.js';
import { AlfredLogger } from './alfred-logger.js';
import { AlfredFormatter } from './alfred-formatter.js';

export class AlfredPlatform {
  config() {
    return new AlfredConfig();
  }

  cache() {
    return new AlfredCache();
  }

  logger() {
    return new AlfredLogger();
  }

  formatter() {
    return new AlfredFormatter();
  }
}
