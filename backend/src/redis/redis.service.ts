import { Injectable, Inject } from '@nestjs/common';
import { Redis } from '@upstash/redis';
import { REDIS_CLIENT } from './redis.constants';

@Injectable()
export class RedisService {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  // Basic operations
  async get(key: string): Promise<string | null> {
    return this.redis.get<string>(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.redis.setex(key, ttlSeconds, value);
    } else {
      await this.redis.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.redis.exists(key);
    return result === 1;
  }

  // Hash operations for quiz state
  async hset(key: string, field: string, value: string): Promise<void> {
    await this.redis.hset(key, { [field]: value });
  }

  async hget(key: string, field: string): Promise<string | null> {
    return this.redis.hget<string>(key, field);
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    const result = await this.redis.hgetall<Record<string, string>>(key);
    return result || {};
  }

  async hdel(key: string, ...fields: string[]): Promise<void> {
    await this.redis.hdel(key, ...fields);
  }

  async hincrby(key: string, field: string, increment: number): Promise<number> {
    return this.redis.hincrby(key, field, increment);
  }

  // Set operations for active users
  async sadd(key: string, ...members: string[]): Promise<void> {
    await this.redis.sadd(key, members);
  }

  async srem(key: string, ...members: string[]): Promise<void> {
    await this.redis.srem(key, members);
  }

  async smembers(key: string): Promise<string[]> {
    return this.redis.smembers(key);
  }

  async scard(key: string): Promise<number> {
    return this.redis.scard(key);
  }

  async sismember(key: string, member: string): Promise<boolean> {
    const result = await this.redis.sismember(key, member);
    return result === 1;
  }

  // Sorted set operations for leaderboard
  async zadd(key: string, score: number, member: string): Promise<void> {
    await this.redis.zadd(key, { score, member });
  }

  async zincrby(key: string, increment: number, member: string): Promise<number> {
    return this.redis.zincrby(key, increment, member);
  }

  async zrevrange(key: string, start: number, stop: number): Promise<string[]> {
    return this.redis.zrange(key, start, stop, { rev: true });
  }

  async zrevrangeWithScores(
    key: string,
    start: number,
    stop: number,
  ): Promise<{ member: string; score: number }[]> {
    const result = await this.redis.zrange(key, start, stop, {
      rev: true,
      withScores: true,
    });

    // Upstash returns array of [member, score, member, score, ...]
    const entries: { member: string; score: number }[] = [];
    for (let i = 0; i < result.length; i += 2) {
      entries.push({
        member: result[i] as string,
        score: result[i + 1] as number,
      });
    }
    return entries;
  }

  async zrank(key: string, member: string): Promise<number | null> {
    return this.redis.zrank(key, member);
  }

  async zscore(key: string, member: string): Promise<string | null> {
    const score = await this.redis.zscore(key, member);
    return score !== null ? String(score) : null;
  }

  // Pub/Sub for real-time events
  async publish(channel: string, message: string): Promise<void> {
    await this.redis.publish(channel, message);
  }

  // Key expiration
  async expire(key: string, seconds: number): Promise<void> {
    await this.redis.expire(key, seconds);
  }

  // Pattern-based key deletion
  async deleteByPattern(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}
