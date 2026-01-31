import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from '@upstash/redis';
import { RedisService } from './redis.service';
import { REDIS_CLIENT } from './redis.constants';

export { REDIS_CLIENT };

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: (configService: ConfigService): Redis => {
        const url = configService.getOrThrow<string>('UPSTASH_REDIS_REST_URL');
        const token = configService.getOrThrow<string>('UPSTASH_REDIS_REST_TOKEN');
        return new Redis({ url, token });
      },
      inject: [ConfigService],
    },
    RedisService,
  ],
  exports: [REDIS_CLIENT, RedisService],
})
export class RedisModule {}
