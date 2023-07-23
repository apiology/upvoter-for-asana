import alfy from 'alfy';

export class AlfredCache {
  cacheFetch = async (key: string, clazz: 'string'): Promise<string | null> => {
    if (clazz !== 'string') {
      throw new Error(`I do not know how to cache items of class ${clazz}`);
    }
    return alfy.cache.get(key);
  };

  cacheStore = async (key: string, value: string): Promise<void> => {
    alfy.cache.set(key, value);
  };
}
