import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../attributes/entities/product/product.entity';
import { ShopGeneral } from '../shop/entities/shop-general.entity';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { AppOnboardingLog } from './entities/analytics-onboarding-log.entity';
import { TouchpointsLog } from './entities/analytics-touchpoints-log.entity';
import { CollectionProduct } from 'src/modules/attributes/entities/collection/collection-product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AppOnboardingLog, TouchpointsLog, ShopGeneral, Product, CollectionProduct])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
