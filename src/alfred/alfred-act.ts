import { actOnInputData } from '../upvoter-for-asana.js';
import { AlfredPlatform } from './alfred-platform.js';
import { setPlatform } from '../platform.js';

setPlatform(new AlfredPlatform());
const arg = process.argv[2];
if (arg === undefined) {
  throw new Error('No input');
}
actOnInputData(arg);
