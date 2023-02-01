import { AlfredLogger } from './alfred-logger.js';
import { AlfredFormatter } from './alfred-formatter.js';

// needed to create virtual functions implementing an abstract class
// for TypeScript
/* eslint-disable class-methods-use-this */

export class AlfredPlatform {
  logger() {
    return new AlfredLogger();
  }

  formatter() {
    return new AlfredFormatter();
  }
}
