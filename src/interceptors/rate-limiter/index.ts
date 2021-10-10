import * as RateLimiter from 'rate-limiter-flexible';
import * as redis from 'redis';
import * as moment from 'moment';
import { Response, Request } from 'express';
import { HttpStatus, Injectable, NestMiddleware, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FetchLimiter implements NestMiddleware {
  limiter: RateLimiter.RateLimiterRedis;
  constructor(
    @Inject(ConfigService)
    private readonly config: ConfigService,
  ) {
    const connection: redis.ClientOpts = config.get<string>('cache.uri')
      ? { url: config.get<string>('cache.uri') }
      : {
          host: config.get<string>('cache.host'),
          port: config.get<number>('cache.port'),
          db: config.get<number>('cache.db'),
        };

    this.limiter = new RateLimiter.RateLimiterRedis({
      storeClient: redis.createClient({
        enable_offline_queue: false,
        ...connection,
      }),
      points: 4, // Number of points
      duration: 1, // Per second(s)
      keyPrefix: 'rlflx', // must be unique for limiters with different purpose
      execEvenly: true,
    });
  }

  async use(req: Request, res: Response, next: () => void) {
    try {
      const userId = req.query['userId'] ?? req.body['userId'] ?? 0;
      await this.limiter.consume(`p_${req.path}_ip_${req.ip}_u_${userId}`);
      return next();
    } catch (rateLimiterRes) {
      const error = `You've made too many attempts in a short period of time, please try again at ${moment()
        .add(rateLimiterRes.msBeforeNext, 'milliseconds')
        .format()}`;
      return res.status(HttpStatus.TOO_MANY_REQUESTS).send({ error });
    }
  }
}
