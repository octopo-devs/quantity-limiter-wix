import { Global, Module } from '@nestjs/common';
import { ApiModule } from './api/api.module';
import { QueueModule } from './queue/queue.module';
import { LoggerModule } from './logger/logger.module';
import { AuthModule } from './auth/auth.module';
import { CustomCacheModule } from './custom-cache/custom-cache.module';
import { ShopGeneral } from 'src/modules/shop/entities/shop-general.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([ShopGeneral]),
    ApiModule,
    QueueModule,
    LoggerModule,
    AuthModule,
    CustomCacheModule,
  ],
  exports: [ApiModule, QueueModule, LoggerModule, AuthModule, CustomCacheModule, TypeOrmModule],
})
export class SharedModule {}
