import { Logger } from './logger.js';
import { Formatter } from './formatter.js';

interface Platform {
  logger(): Logger;

  formatter(): Formatter;
}

let thePlatform: Platform | null = null;

export const platform = (): Platform => {
  if (thePlatform == null) {
    throw Error('Please call setPlatform() before use');
  }
  return thePlatform;
};

export const setPlatform = (newPlatform: Platform) => {
  thePlatform = newPlatform;
};
