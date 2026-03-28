import { Module } from '@nestjs/common';
import { CronController } from './cron.controller';
import { CronService } from './cron.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttributeCronService } from './services/attribute-cron.service';
import { ShopInfo } from 'src/modules/shop/entities/shop-info.entity';
import { AttributeCron } from 'src/modules/attributes/entities/attribute-cron.entity';
import { AttributesModule } from 'src/modules/attributes/attributes.module';
import { ShopGeneral } from 'src/modules/shop/entities/shop-general.entity';
import { ShopInstalled } from 'src/modules/shop/entities/shop-installed.entity';
import { AdminDailyCronService } from './services/admin-daily-cron.service';
import { AdminModule } from 'src/modules/admin/admin.module';
import { AdminDailyLog } from 'src/modules/admin/entities/admin-daily-log.entity';
import { RemoveDataCronService } from './services/remove-data-cron.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ShopInfo, ShopGeneral, ShopInstalled, AttributeCron, AdminDailyLog]),
    AttributesModule,
    AdminModule,
  ],
  controllers: [CronController],
  providers: [CronService, AttributeCronService, AdminDailyCronService, RemoveDataCronService],
})
export class CronModule {}
