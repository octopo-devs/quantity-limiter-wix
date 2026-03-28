import { Module } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { WebhookController } from './webhook.controller';
import { AdminModule } from '../admin/admin.module';
import { WixApiService } from 'src/shared/api/services/wix-api.service';
import { ShopModule } from 'src/modules/shop/shop.module';
import { JwtService } from '@nestjs/jwt';
@Module({
  imports: [AdminModule, ShopModule],
  controllers: [WebhookController],
  providers: [WebhookService, WixApiService, JwtService],
})
export class WebhookModule {}
