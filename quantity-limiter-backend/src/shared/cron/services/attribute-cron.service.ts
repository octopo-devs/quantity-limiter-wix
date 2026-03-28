import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { AttributesService } from 'src/modules/attributes/attributes.service';
import { AttributeCron } from 'src/modules/attributes/entities/attribute-cron.entity';
import { CronAttributeStatus } from 'src/modules/attributes/types/attributes.enum';
import { ShopInfo } from 'src/modules/shop/entities/shop-info.entity';
import { LessThan, Repository } from 'typeorm';

@Injectable()
export class AttributeCronService {
  constructor(
    private readonly attributesService: AttributesService,
    @InjectRepository(ShopInfo)
    private readonly shopInfoRepository: Repository<ShopInfo>,
    @InjectRepository(AttributeCron)
    private readonly attributeCronRepository: Repository<AttributeCron>,
  ) {}

  @Cron(
    CronExpression.EVERY_MINUTE,
    //  { disabled: process.env.name !== 'wix-quantity-limiter-backend-cron' }
  )
  async cronAttributes() {
    const attributesCrons = await this.attributeCronRepository.find({
      where: { status: CronAttributeStatus.Pending, retry: LessThan(3) },
      order: { retry: 'ASC', updatedAt: 'ASC' },
      take: 10,
    });
    if (!attributesCrons.length) return console.log('cronAttributes no job');
    console.log('cronAttributes start', attributesCrons.length);
    await Promise.all(attributesCrons.map(async (cron) => await this.processShopAttributesCronGraphQL(cron)));
    console.log('cronAttributes completed', attributesCrons.length);
  }

  async processShopAttributesCronGraphQL(cron: AttributeCron) {
    cron.retry += 1;
    const { shop, id } = cron;
    await this.attributeCronRepository.update({ id }, { status: CronAttributeStatus.Processing, retry: cron.retry });
    const shopInfo = await this.shopInfoRepository.findOne({ where: { shop } });

    if (!shopInfo?.refreshToken) return await this.updateFailedCron(cron, 'Shop token not found');
    try {
      await Promise.all([
        this.attributesService.syncProductFromWix(shop),
        this.attributesService.syncCollectionFromWix(shop),
      ]);
    } catch (err) {
      console.log(err);
      return await this.updateFailedCron(cron, err.message);
    }
    await this.attributeCronRepository.update({ id }, { status: CronAttributeStatus.Completed, logs: null });
  }

  async updateFailedCron(cron: AttributeCron, logs?: string) {
    const { shop, id, retry } = cron;
    let status = CronAttributeStatus.Pending;
    if (retry >= 3) status = CronAttributeStatus.MaxRetryReached;
    await this.attributeCronRepository.update({ id }, { status, logs });
    console.log('Attribute cron failed', shop, status, logs);
  }
}
