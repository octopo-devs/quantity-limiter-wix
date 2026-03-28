import { Module } from '@nestjs/common';
import { WixService } from './wix.service';
import { WixController } from './wix.controller';
import { ShopModule } from '../shop/shop.module';
import { WixApiService } from 'src/shared/api/services/wix-api.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [ShopModule],
  controllers: [WixController],
  providers: [WixService, WixApiService, JwtService],
})
export class WixModule {}
