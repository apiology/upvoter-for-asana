import { AlfredCache } from './alfred-cache.js';
import { AlfredConfig } from './alfred-config.js';
import { AlfredLogger } from './alfred-logger.js';
import { AlfredFormatter } from './alfred-formatter.js';

// needed to create virtual functions implementing an abstract class
// for TypeScript
/* eslint-disable class-methods-use-this */

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
