import { Module } from '@nestjs/common';
import { CustomCacheService } from './custom-cache.service';
import { CacheModule } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';

@Module({
  imports: [
    CacheModule.registerAsync({
      useFactory: async () => {
        return {
          stores: [
            createKeyv(
              {
                socket: {
                  host: process.env.REDIS_HOST,
                  port: Number(process.env.REDIS_PORT || 6379),
                  connectTimeout: 5000,
                },
              },
              {
                namespace: 'quantity-limiter-wix-backend',
                connectionTimeout: 5000,
              },
            ),
          ],
          ttl: 1,
          nonBlocking: true,
        };
      },
    }),
  ],
  providers: [CustomCacheService],
  exports: [CustomCacheService, CacheModule],
})
export class CustomCacheModule {}
