import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminModule } from 'src/modules/admin/admin.module';
import { ShopGeneral } from 'src/modules/shop/entities/shop-general.entity';
import { ShopInfo } from 'src/modules/shop/entities/shop-info.entity';
import { ShopInstalled } from 'src/modules/shop/entities/shop-installed.entity';
import { ApiService } from './api.service';
import { AnalyticApiService } from './services/analytics-api.service';
import { AwsApiService } from './services/aws-api.service';
import { CannyApiService } from './services/canny-api.service';
import { CustomerIoApiService } from './services/customer-io-api.service';
import { SampleApiService } from './services/sample-api.service';

@Module({
  imports: [TypeOrmModule.forFeature([ShopInfo, ShopInstalled, ShopGeneral]), AdminModule],
  providers: [ApiService, SampleApiService, AnalyticApiService, CustomerIoApiService, CannyApiService, AwsApiService],
  exports: [ApiService, SampleApiService, AnalyticApiService, CustomerIoApiService, CannyApiService, AwsApiService],
})
export class ApiModule {}
