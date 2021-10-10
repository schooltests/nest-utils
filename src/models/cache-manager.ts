export type CacheManager = {
  del: (key: string) => Promise<void>;
  set: (key: string, value: any, {}: { ttl: number }) => Promise<void>;
  get: <T>(key: string) => Promise<T>;
  keys: () => Promise<string[]>;
  store: {
    getClient: () => RedisClient;
  };
};

type RedisClient = {
  hmset: (hashKey: any, row: any, value: any) => void;
  hgetall: (hashKey: any, cb: (err: any, value: any) => void) => void;
  hdel: (hashKey: any, row?: any) => void;
  expire: (hashKey: any, ttl: number) => void;
};
