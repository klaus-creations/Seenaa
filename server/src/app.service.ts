import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createRedisClient } from './lib/redis-client';
import { Redis } from '@upstash/redis';
import { nanoid } from 'nanoid';

export const UUID_LENGTH = 5;
const EIGHT_HOUR_IN_SEC = 3600 * 8;
export const EIGHT_HOUR_IN_MS = EIGHT_HOUR_IN_SEC * 1000;

export type ShortLinkCacheValues = {
  createadAt: number;
  expiredAt: number;
  actualLink: string;
  k: string;
};

@Injectable()
export class AppService {
  private redis: Redis;

  constructor(private configService: ConfigService) {
    const restUrl = this.configService.getOrThrow<string>(
      'UPSTASH_REDIS_REST_URL',
    );
    const restToken = this.configService.getOrThrow<string>(
      'UPSTASH_REDIS_REST_TOKEN',
    );

    this.redis = createRedisClient(restUrl, restToken);
  }

  async setShortUrlToCache(linkToShorten: string, userId: string) {
    const pathKey = `${nanoid(UUID_LENGTH)}:${userId}`;

    const payload: ShortLinkCacheValues = {
      createadAt: Date.now(),
      expiredAt: Date.now() + EIGHT_HOUR_IN_MS,
      actualLink: linkToShorten,
      k: pathKey,
    };

    const res = await this.redis.set(pathKey, payload, {
      ex: EIGHT_HOUR_IN_SEC,
    });

    return res ? pathKey : null;
  }

  async getShortUrlFromCache(pathKey: string) {
    return await this.redis.get<ShortLinkCacheValues>(pathKey);
  }

  async getAllShortUrlsFromCacheForUser(userId: string) {
    const keys = await this.redis.keys(`*${userId}*`);
    if (!keys.length) return [];

    return await this.redis.mget<ShortLinkCacheValues[]>(...keys);
  }
}
