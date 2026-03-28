import { Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { QueueController } from './queue.controller';
import { BullModule } from '@nestjs/bull';
import { QueueProcessor } from './types/queue.enum';
import { AttributesModule } from 'src/modules/attributes/attributes.module';
import { CustomerIoProcessor } from './processors/customer-io.processor';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from 'src/modules/attributes/entities/product/product.entity';
import { ShopInfo } from 'src/modules/shop/entities/shop-info.entity';
import { ShopifyProcessor } from './processors/sync-data-shopify.processor';
import { WixApiService } from 'src/shared/api/services/wix-api.service';
import { ProductSKU } from 'src/modules/attributes/entities/product/product-sku.entity';
import { ProductVariant } from 'src/modules/attributes/entities/product/product-variant.entity';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    BullModule.registerQueue({ name: QueueProcessor.CustomerIO }, { name: QueueProcessor.Wix }),
    AttributesModule,
    TypeOrmModule.forFeature([Product, ShopInfo, ProductSKU, ProductVariant]),
  ],
  controllers: [QueueController],
  providers: [QueueService, CustomerIoProcessor, ShopifyProcessor, WixApiService, JwtService],
  exports: [BullModule],
})
export class QueueModule {}
