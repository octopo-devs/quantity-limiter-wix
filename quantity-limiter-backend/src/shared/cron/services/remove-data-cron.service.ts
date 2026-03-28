import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { ShopInstalled } from 'src/modules/shop/entities/shop-installed.entity';
import { EventEmitterName } from 'src/shared/common/types/shared.enum';
import { Between, Repository } from 'typeorm';

@Injectable()
export class RemoveDataCronService {
  constructor(
    @InjectRepository(ShopInstalled)
    private readonly shopInstalledRepository: Repository<ShopInstalled>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_10AM, { disabled: process.env.name !== 'wix-quantity-limiter-backend-cron' })
  async removeUninstallOrCloseShopData() {
    const now = Date.now();
    const FROM = 35;
    const TO = 30;
    const fromDate = new Date(now - FROM * 24 * 60 * 60 * 1000);
    const toDate = new Date(now - TO * 24 * 60 * 60 * 1000);
    const shopsUninstallOrCloseStore = await this.shopInstalledRepository.find({
      where: [
        { uninstalled: true, dateUninstalled: Between(fromDate, toDate) },
        { closeStore: true, dateCloseStore: Between(fromDate, toDate) },
      ],
    });
    const total = shopsUninstallOrCloseStore.length;
    console.log('removeUninstallOrCloseStoreShopData', total);
    for (const { shop } of shopsUninstallOrCloseStore) {
      console.log('removeUninstallOrCloseStoreShopData', shop);
      try {
        await this.eventEmitter.emitAsync(EventEmitterName.DataRemove, { shop });
      } catch (err) {
        console.log('removeUninstallOrCloseStoreShopData', err.message);
      }
    }
    console.log('removeUninstallOrCloseStoreShopData completed', total);
  }
}
