import * as Redis from 'ioredis';

export const redisOptsFromUrl = (urlString: string): Redis.RedisOptions => {
  const redisOpts: Redis.RedisOptions = {};
  try {
    const redisUrl = new URL(urlString);
    redisOpts.port = Number(redisUrl.port) || 6379;
    redisOpts.host = redisUrl.hostname;
    redisOpts.db = redisUrl.pathname ? Number(redisUrl.pathname.split('/')[1]) : 0;
    redisOpts.password = redisUrl.password;
    redisOpts.username = redisUrl.username;
    if (redisUrl.protocol === 'rediss:') {
      redisOpts.tls = {};
    }
  } catch (e) {
    throw new Error(e.message);
  }
  return redisOpts;
};
