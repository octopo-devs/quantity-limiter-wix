import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { CustomCacheService } from '../custom-cache/custom-cache.service';
import { QueryResultCache } from 'typeorm/cache/QueryResultCache';
import { QueryResultCacheOptions } from 'typeorm/cache/QueryResultCacheOptions';
import { QueryRunner } from 'typeorm';

@Injectable()
export class CustomQueryResultCache implements QueryResultCache, OnModuleDestroy {
  constructor(private readonly customCacheService: CustomCacheService) {}

  async connect() {
    console.log('CustomQueryResultCache connected');
  }
  async disconnect() {
    console.log('CustomQueryResultCache disconnected');
  }
  async synchronize(_queryRunner?: QueryRunner) {
    console.log('CustomQueryResultCache synchronized');
  }

  getFromCache(options: QueryResultCacheOptions): Promise<QueryResultCacheOptions | undefined> {
    return this.customCacheService.get(options.identifier || options.query);
  }

  async storeInCache(options: QueryResultCacheOptions, savedCache: QueryResultCacheOptions): Promise<void> {
    await this.customCacheService.set(options.identifier || options.query, options, options.duration || 1000);
  }

  async remove(identifiers: string[]): Promise<void> {
    for (const identifier of identifiers) {
      await this.customCacheService.del(identifier);
    }
  }

  isExpired(_savedCache: QueryResultCacheOptions): boolean {
    return false;
  }

  async clear(_queryRunner?: QueryRunner) {
    await this.customCacheService.clear();
  }

  onModuleDestroy() {
    console.log(
      'CustomQueryResultCache is being destroyed. The underlying connection is managed by CustomCacheModule.',
    );
  }
}
