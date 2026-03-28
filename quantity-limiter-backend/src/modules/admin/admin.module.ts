import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppOnboardingLog } from '../analytics/entities/analytics-onboarding-log.entity';
import { ShopGeneral } from '../shop/entities/shop-general.entity';
import { ShopInfo } from '../shop/entities/shop-info.entity';
import { ShopInstalled } from '../shop/entities/shop-installed.entity';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminDailyLog } from './entities/admin-daily-log.entity';
import { AdminDailyUninstallLog } from './entities/admin-daily-uninstall-log.entity';
import { AppPerformanceLog } from './entities/admin-performance-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ShopGeneral,
      ShopInfo,
      ShopInstalled,
      AdminDailyLog,
      AppPerformanceLog,
      AppOnboardingLog,
      AdminDailyUninstallLog,
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
