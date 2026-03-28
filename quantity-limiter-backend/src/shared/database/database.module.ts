import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { dataSourceOptions } from 'db/data-source';
import { CustomQueryResultCache } from './query-cache';
import { CustomCacheService } from '../custom-cache/custom-cache.service';
import { CustomCacheModule } from '../custom-cache/custom-cache.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [CustomCacheModule],
      inject: [CustomCacheService],
      useFactory: async (customCacheService: CustomCacheService): Promise<TypeOrmModuleOptions> => ({
        ...dataSourceOptions,
        cache: {
          provider: () => new CustomQueryResultCache(customCacheService),
          ignoreErrors: true,
        },
      }),
    }),
    // TypeOrmModule.forRoot(dataSourceOptions),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
