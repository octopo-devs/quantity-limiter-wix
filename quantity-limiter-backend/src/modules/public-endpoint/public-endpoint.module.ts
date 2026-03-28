import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WixApiService } from 'src/shared/api/services/wix-api.service';
import { Rule } from '../rules/entities/rule.entity';
import { AttributesModule } from '../attributes/attributes.module';
import { ShopModule } from '../shop/shop.module';
import { PublicEndpointController } from './public-endpoint.controller';
import { PublicEndpointService } from './public-endpoint.service';

@Module({
  imports: [ShopModule, AttributesModule, TypeOrmModule.forFeature([Rule])],
  controllers: [PublicEndpointController],
  providers: [PublicEndpointService, WixApiService, JwtService],
})
export class PublicEndpointModule {}
