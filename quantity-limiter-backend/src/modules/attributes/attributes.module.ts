import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CollectionProduct } from 'src/modules/attributes/entities/collection/collection-product.entity';
import { ProductSKU } from 'src/modules/attributes/entities/product/product-sku.entity';
import { ProductVariant } from 'src/modules/attributes/entities/product/product-variant.entity';
import { ShopInfo } from 'src/modules/shop/entities/shop-info.entity';
import { WixApiService } from 'src/shared/api/services/wix-api.service';
import { ShopInstalled } from '../shop/entities/shop-installed.entity';
import { ShopModule } from '../shop/shop.module';
import { AttributesController } from './attributes.controller';
import { AttributesService } from './attributes.service';
import { AttributeCron } from './entities/attribute-cron.entity';
import { Collection } from './entities/collection/collection.entity';
import { Product } from './entities/product/product.entity';
import { BrandService } from './services/brand.service';
import { CollectionService } from './services/collection.service';
import { ProductService } from './services/product.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Collection,
      Product,
      AttributeCron,
      ProductSKU,
      ShopInstalled,
      ShopInfo,
      ProductVariant,
      CollectionProduct,
    ]),
    ShopModule,
    JwtModule,
    AttributesModule,
  ],
  controllers: [AttributesController],
  providers: [ProductService, BrandService, CollectionService, AttributesService, WixApiService],
  exports: [ProductService, CollectionService, AttributesService],
})
export class AttributesModule {}
