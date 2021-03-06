import { CacheModule, CACHE_MANAGER, Global, Inject, Injectable, Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-ioredis';
import { CacheManager, JsKey } from '../models';

export const enum HashKey {
  Nothing = 'Nothing',
}

export interface HashValue {
  [HashKey.Nothing]: unknown;
}

export interface HashKeys {
  allKeys: HashKey;
}

@Injectable()
export class RedisHashService {
  private readonly logger = new Logger(RedisHashService.name);
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: CacheManager) {}

  hset<K extends JsKey, HK extends HashKeys['allKeys']>(hashKey: HK, row: K, value: HashValue[HK]) {
    this.logger.debug(`Set hash ${hashKey} and row ${String(row)}`);
    this.cacheManager.store.getClient().hmset(hashKey, { [row]: JSON.stringify(value) });
  }

  async hsetWithExpire<K extends JsKey, HK extends HashKeys['allKeys']>(
    hashKey: HK,
    row: K,
    value: HashValue[HK],
    ttl: number,
  ) {
    this.logger.debug(`Set hash ${hashKey} and row ${String(row)}`);
    const hashWasCreated = !!(await this.cacheManager.store.getClient().exists(hashKey));

    this.cacheManager.store.getClient().hmset(hashKey, { [row]: JSON.stringify(value) });

    if (!hashWasCreated) {
      this.hexpire(hashKey, ttl);
    }
  }

  hdel<K extends JsKey>(hashKey: HashKeys['allKeys'], row?: K) {
    if (row) {
      this.logger.debug(`Delete row ${String(row)} in hash ${hashKey}`);
      this.cacheManager.store.getClient().hdel(hashKey, String(row));
    } else {
      this.logger.debug(`Delete complete hash ${hashKey}`);
      this.cacheManager.del(hashKey);
    }
  }

  hexpire(hashKey: HashKeys['allKeys'], ttl: number) {
    this.logger.debug(`Set expire on hash ${hashKey}`);
    this.cacheManager.store.getClient().expire(hashKey, ttl);
  }

  async hget<K extends JsKey, HK extends HashKeys['allKeys']>(hashKey: HK, row: K) {
    return new Promise<HashValue[HK]>((res, rej) => {
      this.cacheManager.store.getClient().hget(hashKey, String(row), (err, value) => {
        if (err) {
          return rej(err);
        }

        return res(value);
      });
    });
  }

  async hgetField<K extends JsKey, HK extends HashKeys['allKeys']>(hashKey: HK, row: K) {
    const value = await this.hget<K, HK>(hashKey, row);
    if (!value) {
      return null;
    }
    const parsed = JSON.parse(value as unknown as string) as typeof value;

    this.logger.debug(`Selecting hash ${hashKey} and row ${String(row)}`);

    return parsed;
  }
}

const redisConnection = CacheModule.registerAsync({
  useFactory: async (configService: ConfigService) =>
    !configService.get<string>('cache.uri')
      ? {
          store: redisStore,
          host: configService.get<string>('cache.host'),
          port: configService.get<number>('cache.port'),
          db: configService.get<number>('cache.db'),
        }
      : { url: configService.get<string>('cache.uri'), store: redisStore },
  inject: [ConfigService],
});

@Global()
@Module({
  imports: [redisConnection],
  providers: [RedisHashService],
  exports: [redisConnection, RedisHashService],
})
export class RedisCacheModule {}
