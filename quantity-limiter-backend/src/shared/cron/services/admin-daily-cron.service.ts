import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { AdminService } from 'src/modules/admin/admin.service';
import { AdminDailyLog } from 'src/modules/admin/entities/admin-daily-log.entity';
import { ShopGeneral } from 'src/modules/shop/entities/shop-general.entity';
import { ShopInfo } from 'src/modules/shop/entities/shop-info.entity';
import { ShopInstalled } from 'src/modules/shop/entities/shop-installed.entity';
import { isTestShop } from 'src/shared/common/utils/functions';
import { In, Repository } from 'typeorm';

@Injectable()
export class AdminDailyCronService {
  constructor(
    private adminService: AdminService,
    @InjectRepository(ShopInfo)
    private readonly shopInfoRepository: Repository<ShopInfo>,
    @InjectRepository(ShopGeneral)
    private readonly shopGeneralRepository: Repository<ShopGeneral>,
    @InjectRepository(ShopInstalled)
    private readonly shopInstalledRepository: Repository<ShopInstalled>,
    @InjectRepository(AdminDailyLog)
    private readonly adminDailyLogRepository: Repository<AdminDailyLog>,
  ) {}

  @Cron(CronExpression.EVERY_HOUR, { disabled: process.env.name !== 'wix-order-limiter-backend-cron' })
  async dailyAnalyticCron(): Promise<any> {
    console.log('dailyAnalyticCron');
    const activeShops = await this.shopInstalledRepository.find({ where: { uninstalled: false, closeStore: false } });
    const shops = activeShops.map((activeShop) => activeShop.shop);
    const shopsInfos = await this.shopInfoRepository.find({ where: { shop: In(shops) } });
    const ignoreTestShopsInfo = shopsInfos.filter((shopInfo) => !isTestShop(shopInfo));
    const ignoreTestShops = ignoreTestShopsInfo.map((shopInfo) => shopInfo.shop);
    const ignoreTestShopsGeneral = await this.shopGeneralRepository.find({ where: { shop: In(ignoreTestShops) } });
    const now = new Date();
    const dailyLog = await this.adminService.getDateAnalytic(now, ignoreTestShopsGeneral);
    await this.adminDailyLogRepository.save(dailyLog);
  }
}
