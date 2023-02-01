export abstract class Cache {
  abstract cacheFetch(key: string,
    clazz: 'string'): Promise<string | null>;

  abstract cacheStore(key: string, value: string): Promise<void>;
}
