import { InjectQueue } from '@nestjs/bull';
import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bull';
import { DefaultAuthRequest } from 'src/docs/default/default-request.swagger';
import { DefaultResponse } from 'src/docs/default/default-response.swagger';
import { AwsApiService } from 'src/shared/api/services/aws-api.service';
import { CannyApiService } from 'src/shared/api/services/canny-api.service';
import { PlanSubscription, PricingPlan } from 'src/shared/api/types/wix-api/wix-api.enum';
import { DEFAULT_PER_PAGE, LIMITATION_BY_PLAN } from 'src/shared/common/types/shared.constant';
import { EventEmitterName } from 'src/shared/common/types/shared.enum';
import { formatMetaResponse, safeJsonParse, unixTimestamp } from 'src/shared/common/utils/functions';
import { CustomerIOProcess, QueueProcessor } from 'src/shared/queue/types/queue.enum';
import { FindManyOptions, FindOneOptions, FindOptionsWhere, Repository } from 'typeorm';
import { UpdateReportAction } from '../admin/types/admin.enum';
import { IAppInstallEventPayload, IWixShopData } from '../wix/types/wix.interface';
import { UpdateGeneralSettingDto, UpdateOnboardingDto } from './dto/shop.dto';
import { ShopGeneral } from './entities/shop-general.entity';
import { ShopInfo } from './entities/shop-info.entity';
import { ShopInstalled } from './entities/shop-installed.entity';
import {
  CrispData,
  GetCannyTokenResponse,
  GetShopInfoResponse,
  ShopCrispDataResponse,
  ShopGeneralSettingResponse,
  UpdateShopGeneralSettingResponse,
} from './response/shop.response';
import { IShopUpdateEvent } from './types/shop.interface';
@Injectable()
export class ShopService {
  constructor(
    private readonly awsApiService: AwsApiService,
    private readonly eventEmitter: EventEmitter2,
    private readonly cannyApiService: CannyApiService,
    @InjectRepository(ShopGeneral)
    private readonly shopGeneralRepository: Repository<ShopGeneral>,
    @InjectRepository(ShopInfo)
    private readonly shopInfoRepository: Repository<ShopInfo>,
    @InjectRepository(ShopInstalled)
    private readonly shopInstalledRepository: Repository<ShopInstalled>,
    @InjectQueue(QueueProcessor.CustomerIO)
    private customerIoQueue: Queue,
  ) {}

  async getShopInfo(payload: DefaultAuthRequest): Promise<GetShopInfoResponse> {
    const shopInfo = await this.shopInfoRepository.findOne({ where: { shop: payload.shop } });
    const shopInstalled = await this.shopInstalledRepository.findOne({
      select: ['lastInstalledDate'],
      where: {
        shop: payload.shop,
      },
    });

    if (!shopInfo) throw new NotFoundException('Shop info not found');
    return {
      code: 200,
      status: 'success',
      data: {
        country: shopInfo.country,
        email: shopInfo.email,
        shop: payload.shop,
        shopName: shopInfo.name,
        siteUrl: shopInfo.siteUrl,
        lastInstalledDate: shopInstalled.lastInstalledDate,
      },
    };
  }

  async updateOnboarding(payload: UpdateOnboardingDto): Promise<DefaultResponse> {
    const { shop } = payload;
    await this.shopGeneralRepository.update({ shop }, { displayOnboarding: false });
    return { code: 200, status: 'success' };
  }

  convertWeekWorkingDays(weekWorkingDays: string): string {
    const dataWeekWorkingDays = safeJsonParse(weekWorkingDays);
    if (
      Array.isArray(dataWeekWorkingDays) ||
      !['prepareAndDelivery', 'prepare', 'delivery'].some((key) => key in dataWeekWorkingDays)
    ) {
      return JSON.stringify({
        prepareAndDelivery: dataWeekWorkingDays,
        prepare: dataWeekWorkingDays,
        delivery: dataWeekWorkingDays,
      });
    }
    return JSON.stringify(dataWeekWorkingDays);
  }

  async getShopGeneral(payload: DefaultAuthRequest, user: Record<string, any>): Promise<ShopGeneralSettingResponse> {
    const { shop } = payload;
    const shopGeneral = await this.shopGeneralRepository.findOne({ where: { shop } });
    if (!shopGeneral) throw new NotFoundException('Shop general not found');
    if (!user?.isInternalAccess) this.shopGeneralRepository.update({ shop }, { lastAccess: unixTimestamp() });
    return {
      code: 200,
      data: { ...shopGeneral },
      meta: formatMetaResponse(1, DEFAULT_PER_PAGE, 1, 1),
      status: 'success',
    };
  }

  async updateShopGeneral(payload: UpdateGeneralSettingDto): Promise<UpdateShopGeneralSettingResponse> {
    const { shop, ...rest } = payload;
    const shopGeneral = await this.shopGeneralRepository.findOne({ where: { shop } });
    if (!shopGeneral) throw new NotFoundException('Shop general not found');
    // validate feature plan
    const shopFeatures = LIMITATION_BY_PLAN[shopGeneral.plan] || [];

    // if (
    //   (payload.text_size || payload.text_color || payload.icon_color || payload.background_color || payload.border_color) &&
    //   !shopFeatures.includes(AppFeatures.VisualAppearanceEditor) &&
    //   !payload.displayOnboarding
    // ) {
    //   throw new BadRequestException('Visual appearance editor feature required higher plan');
    // }
    // if (payload.get_customer_zipcode && !shopFeatures.includes(AppFeatures.AutoDetectLocation)) {
    //   throw new BadRequestException('Auto detect location feature required higher plan');
    // }
    // if (payload.require_add_to_cart && !shopFeatures.includes(AppFeatures.ZipCodeValidity)) {
    //   throw new BadRequestException('Zip code validity feature required higher plan');
    // }

    const updateShopGeneral = this.shopGeneralRepository.create(rest);
    updateShopGeneral.id = shopGeneral.id;
    const updatedData = await this.shopGeneralRepository.save(updateShopGeneral);

    return {
      code: 200,
      data: { ...updatedData },
      status: 'success',
    };
  }

  async findOneShopGeneral(options: FindOneOptions<ShopGeneral>): Promise<ShopGeneral> {
    return await this.shopGeneralRepository.findOne(options);
  }

  async findShopGeneral(options: FindManyOptions<ShopGeneral>): Promise<ShopGeneral[]> {
    return await this.shopGeneralRepository.find(options);
  }

  async findOneShopInstalled(options: FindOneOptions<ShopInstalled>): Promise<ShopInstalled> {
    return await this.shopInstalledRepository.findOne(options);
  }

  async findShopInstalled(options: FindManyOptions<ShopInstalled>): Promise<ShopInstalled[]> {
    return await this.shopInstalledRepository.find(options);
  }

  async findOneShopInfo(options: FindOneOptions<ShopInfo>): Promise<ShopInfo> {
    return await this.shopInfoRepository.findOne(options);
  }

  async updateShopInstall(query: FindOptionsWhere<ShopInstalled>, payload: Partial<ShopInstalled>): Promise<void> {
    await this.shopInstalledRepository.update(query, payload);
  }

  async getShopCrispData(shop: string): Promise<ShopCrispDataResponse> {
    if (!shop) return;
    const shopInfo = await this.shopInfoRepository.findOne({ where: { shop }, cache: true });

    let shopData: IWixShopData;
    try {
      shopData = safeJsonParse(shopInfo?.shopJson);
    } catch (err) {
      console.log(err);
    }
    if (!shopData) return { code: 404, message: 'Shop data not found' };
    const shopInstalled = await this.shopInstalledRepository.findOne({ where: { shop }, cache: 5 * 1000 });
    const shopGeneral = await this.shopGeneralRepository.findOne({ where: { shop }, cache: true });
    // const reviewHistoryQuery = {
    //   nameReviewer: shopData?.name,
    //   reviewer_location: shopData?.country_name,
    // };
    const crispData: CrispData = {
      appName: 'Wix Order limiter shipping date',
      country: shopData?.country_name || shopInfo.country,
      emailShop: shopData?.email || shopInfo.email,
      firstInstalledDate: shopInstalled?.dateInstalled,
      lastInstalledDate: shopInstalled?.lastInstalledDate,
      phone: shopData?.phone || shopInfo.phone,
      wixPlan: '',
      timezone: shopData?.timezone || shopInfo.timezone,
      city: shopData.city || shopInfo.city,
      nameShop: shopData.name || shopInfo.name,
      uninstalledDate: shopInstalled?.dateUninstalled,
      plan: shopGeneral?.plan,
      instanceId: shop,
      siteUrl: shopInfo.siteUrl,
      // reviewHistory: `https://letsmetrix.com/dashboard/review?${objectToQuerystring(reviewHistoryQuery)}`,
    };
    return { code: 200, data: crispData };
  }

  @OnEvent(EventEmitterName.ShopUpdate)
  async handleShopUpdateEvent({ shop, payload }: IShopUpdateEvent) {
    const properties = payload.event?.properties;
    const { email, phone, siteDisplayName, timeZone, businessName } = properties || {};
    const { country, city, zip } = properties?.address || {};

    const updateShopInfo: Partial<ShopInfo> = {};
    const updates = {
      email,
      phone,
      name: siteDisplayName,
      businessName,
      country,
      timezone: timeZone,
      city,
      zipcode: zip,
    };

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        updateShopInfo[key] = value;
      }
    });

    if (properties) {
      const shopInfo = await this.shopInfoRepository.findOne({ where: { shop } });
      if (shopInfo) {
        const oldShopInfo = JSON.parse(shopInfo.shopJson);
        Object.entries(properties).forEach(([key, value]) => {
          oldShopInfo[key] = value;
        });
        updateShopInfo.shopJson = JSON.stringify(oldShopInfo);
      }
    }
    await this.shopInfoRepository.update({ shop }, updateShopInfo);
  }

  @OnEvent(EventEmitterName.AppUninstall)
  async handleAppUninstalledEvent({ shop }: { shop: string }) {
    const updateShopInstalled: Partial<ShopInstalled> = {
      uninstalled: true,
      dateUninstalled: new Date(),
    };
    try {
      await this.shopInstalledRepository.update({ shop }, updateShopInstalled);
    } catch (err) {
      console.log(err);
    }
  }

  // @OnEvent(EventEmitterName.AppUninstall)
  // async sendCIOUninstallEvent({ shop, payload }: IShopUpdateEvent) {
  //   //Uninstall customerIO
  //   const customerIOData = {
  //     name: 'uninstall',
  //     email: payload.email,
  //     created_at: unixTimestamp(),
  //     store_name: payload.name,
  //     store_url: payload.domain,
  //     country: payload.country,
  //     timezone: payload.timezone,
  //     city: payload.city,
  //     zipcode: payload.zip,
  //     shop_owner: payload.shop_owner,
  //     shopify_plan: payload.plan_name,
  //   };
  //   this.customerIoQueue.add(CustomerIOProcess.Register, { email: payload.email, shop, data: customerIOData });
  //   this.customerIoQueue.add(CustomerIOProcess.SendEvent, { email: payload.email, shop, data: customerIOData });
  // }

  @OnEvent(EventEmitterName.DataRemove)
  async handleResetShopData({ shop }: { shop: string }) {
    if (!shop) return;
    try {
      await this.shopGeneralRepository.update({ shop }, { displayOnboarding: true });
    } catch (err) {
      console.log(err);
    }
  }

  @OnEvent(EventEmitterName.AppInstall)
  async createShopInfo(payload: IAppInstallEventPayload): Promise<void> {
    const { shop, refreshToken, appInstance, siteData } = payload;
    const shopInfoExist = await this.shopInfoRepository.findOne({ where: { shop } });
    const shopInfo = this.shopInfoRepository.create({
      refreshToken,
      shop,
      city: siteData?.properties?.address?.city,
      country: siteData?.properties?.address?.country,
      email: siteData?.properties?.email || appInstance?.site?.ownerInfo?.email,
      name: siteData?.properties?.siteDisplayName,
      phone: siteData?.properties?.phone,
      timezone: siteData?.properties?.timeZone,
      zipcode: siteData?.properties?.address?.zip,
      shopJson: JSON.stringify(siteData),
      id: shopInfoExist?.id,
      siteUrl: appInstance.site.url,
      businessName: siteData?.properties?.businessName,
      siteId: appInstance?.site?.siteId,
      category: siteData?.properties?.categories?.primary,
    });
    await this.shopInfoRepository.save(shopInfo);
  }

  @OnEvent(EventEmitterName.AppInstall)
  async createShopGeneral(payload: IAppInstallEventPayload): Promise<void> {
    const { shop, plan, dateLocale } = payload;
    const shopGeneralExist = await this.shopGeneralRepository.findOne({ where: { shop } });
    const newShopGeneral: Partial<ShopGeneral> = {
      plan: plan ?? PricingPlan.Free,
      shop,
      id: shopGeneralExist?.id,
      dateLocale: dateLocale,
    };
    if (!plan) {
      //if plan is not exist, it mean plan is expired => set is free => update planUpdatedAt
      newShopGeneral.planUpdatedAt = unixTimestamp();
      newShopGeneral.oldPlan = shopGeneralExist?.plan || PricingPlan.Free;
    }
    await this.shopGeneralRepository.save(newShopGeneral);
    this.eventEmitter.emit(EventEmitterName.InitShopSettings, { shop });
  }

  @OnEvent(EventEmitterName.AppInstall)
  async createShopInstalled(payload: IAppInstallEventPayload): Promise<void> {
    const { shop } = payload;
    const shopInstalledExist = await this.shopInstalledRepository.findOne({ where: { shop } });
    if (shopInstalledExist) {
      await this.shopInstalledRepository.update(
        { shop },
        { lastInstalledDate: new Date(), uninstalled: false, closeStore: false },
      );
    } else await this.shopInstalledRepository.save({ shop });
  }

  // @OnEvent(EventEmitterName.AppInstallEvent)
  // async sendAppInstallEvent(payload: IAppInstallEventPayload): Promise<void> {
  //   const { wixShopDetail, shop, refreshToken } = payload;
  //   try {
  //     const shopGeneral = await this.shopGeneralRepository.findOne({ where: { shop } });
  //     if (!shopGeneral) {
  //       throw new NotFoundException('Shop general not found');
  //     }
  //     const date_locale = await this.findShopDefaultLanguage(shop, refreshToken);
  //     await this.shopGeneralRepository.update({ shop }, { enableReadLocales: true, date_locale });
  //   } catch (err) {
  //     console.log(err);
  //   }

  //   //customer io events
  //   // try {
  //   //   const customerData: any = {
  //   //     name: 'install_app',
  //   //     email: wixShopDetail.email,
  //   //     created_at: unixTimestamp(),
  //   //     install_date: new Date(),
  //   //     store_created_at: new Date(wixShopDetail.created_at),
  //   //     store_name: wixShopDetail.name,
  //   //     store_url: wixShopDetail.domain,
  //   //     myshopify_domain: wixShopDetail.myshopify_domain,
  //   //     country: wixShopDetail.country || '',
  //   //     timezone: wixShopDetail.timezone || '',
  //   //     city: wixShopDetail.city || '',
  //   //     zipcode: wixShopDetail.zip || '',
  //   //     shop_owner: wixShopDetail.shop_owner,
  //   //     app_plan: PricingPlan.Free,
  //   //     shopify_plan: wixShopDetail.plan_name,
  //   //   };
  //   //   const installHistory = await this.shopInstalledRepository.findOne({ where: { shop } });
  //   //   if (installHistory && new Date(installHistory.dateUninstalled).getTime()) {
  //   //     customerData.name = 're_install_app';
  //   //     customerData.date_uninstalled = installHistory.dateUninstalled;

  //   //     const rules = await this.ruleRepository.find({
  //   //       where: { shop },
  //   //       relations: ['itemConditions', 'locationConditions'],
  //   //       order: { id: 'DESC' },
  //   //     });
  //   //     await this.handleUpdateRuleStatusByLimitPlan(rules, PricingPlan.Free);
  //   //     this.eventEmitter.emit(EventEmitterName.MetafieldUpdate, { shop });
  //   //   }
  //   //   await this.customerIoQueue.add(CustomerIOProcess.Register, { email: shopifyShopDetail.email, shop, data: customerData });
  //   //   await this.customerIoQueue.add(CustomerIOProcess.SendEvent, { email: shopifyShopDetail.email, shop, data: customerData });
  //   // } catch (err) {
  //   //   console.log(err);
  //   // }
  // }

  @OnEvent(EventEmitterName.PlanPurchase)
  async handleAfterChargeEvent(payload: {
    shop: string;
    plan: PricingPlan;
    subscription: PlanSubscription;
    oldPlan: PricingPlan;
  }): Promise<void> {
    const { shop, plan, oldPlan } = payload;
    if (plan === PricingPlan.Free) {
      if ([PricingPlan.Standard, PricingPlan.Pro, PricingPlan.Plus].includes(oldPlan)) {
        this.eventEmitter.emit(EventEmitterName.ReportUpdate, {
          shop,
          date: new Date(),
          action: UpdateReportAction.DOWNGRADE_FREE,
        });
      }
    } else if (plan === PricingPlan.Standard) {
      if (oldPlan === PricingPlan.Free) {
        this.eventEmitter.emit(EventEmitterName.ReportUpdate, {
          shop,
          date: new Date(),
          action: UpdateReportAction.UPGRADE,
        });
      } else if (oldPlan === PricingPlan.Pro || oldPlan === PricingPlan.Plus) {
        this.eventEmitter.emit(EventEmitterName.ReportUpdate, {
          shop,
          date: new Date(),
          action: UpdateReportAction.DOWNGRADE,
        });
      }
    } else if (plan === PricingPlan.Pro) {
      if ([PricingPlan.Free, PricingPlan.Standard].includes(oldPlan)) {
        this.eventEmitter.emit(EventEmitterName.ReportUpdate, {
          shop,
          date: new Date(),
          action: UpdateReportAction.UPGRADE,
        });
      } else if (oldPlan === PricingPlan.Plus) {
        this.eventEmitter.emit(EventEmitterName.ReportUpdate, {
          shop,
          date: new Date(),
          action: UpdateReportAction.DOWNGRADE,
        });
      }
    } else if (plan === PricingPlan.Plus) {
      if ([PricingPlan.Free, PricingPlan.Standard, PricingPlan.Pro].includes(oldPlan)) {
        this.eventEmitter.emit(EventEmitterName.ReportUpdate, {
          shop,
          date: new Date(),
          action: UpdateReportAction.UPGRADE,
        });
      }
    }
  }

  @OnEvent(EventEmitterName.PlanPurchase)
  async changeShopPlan(payload: {
    shop: string;
    plan: PricingPlan;
    subscription: PlanSubscription;
    oldPlan: PricingPlan;
    planExpiredAt?: Date;
    eventType?: string;
    isFree?: boolean;
  }): Promise<void> {
    const { shop, plan, subscription, oldPlan, eventType, isFree, planExpiredAt } = payload;
    const updateData: Partial<ShopGeneral> = {
      plan,
      oldPlan,
      subscription,
      planUpdatedAt: unixTimestamp(),
      planExpiredAt,
    };
    if (plan === PricingPlan.Free) {
      //
    }

    if (eventType === 'PaidPlanAutoRenewalCancelled') {
      if (isFree) {
        updateData.plan = PricingPlan.Free;
        updateData.planExpiredAt = null;
      }
    }

    await this.shopGeneralRepository.update({ shop }, updateData);
  }

  async getCannyToken(shop: string): Promise<GetCannyTokenResponse> {
    const shopGeneral = await this.shopGeneralRepository.findOne({
      where: { shop },
      select: { shop: true, cannyId: true },
    });
    let cannyId = shopGeneral?.cannyId;
    if (!cannyId) {
      const getCannyId = await this.cannyApiService.upsertCannyUser(shop);
      if (!getCannyId.id) throw new NotFoundException('Cannot create shop canny id');
      cannyId = getCannyId.id;
      await this.shopGeneralRepository.update({ id: shopGeneral.id }, { cannyId });
    }
    const shopInfo = await this.shopInfoRepository.findOne({ where: { shop } });
    const token = this.cannyApiService.generateSSOTokenCanny({ email: shopInfo?.email, id: cannyId, name: shop });
    return { code: 200, data: { token } };
  }

  // @OnEvent(EventEmitterName.ThemesUpdate)
  // async handleThemesUpdateEvent({ shop, payload }: IShopUpdateThemesEvent): Promise<void> {
  //   try {
  //     const shopGeneral = await this.shopGeneralRepository.findOne({ where: { shop } });
  //     if (!shopGeneral) {
  //       console.error('Shop general not found for shop:', shop);
  //       throw new NotFoundException('Shop general not found');
  //     }
  //     const mainTheme = payload?.themes?.find((theme) => theme.role === 'main');
  //     if (!mainTheme) {
  //       console.warn('Main theme not found in payload for shop:', shop);
  //       return;
  //     }
  //     await this.shopGeneralRepository.update({ shop }, { themeName: mainTheme.name, themeStoreId: mainTheme.theme_store_id });
  //   } catch (error) {
  //     console.error('Error in handleThemesUpdateEvent for shop:', shop, error.message);
  //   }
  // }

  async test(shop: string) {
    if (shop === 'skip') shop = undefined;
    const shopsInstalled = await this.shopInstalledRepository.find({
      where: { shop, closeStore: false, uninstalled: false },
    });
    for (const shopInstall of shopsInstalled) {
      const shopInfo = await this.shopInfoRepository.findOne({ where: { shop: shopInstall.shop } });
      if (!shopInfo) {
        await this.shopInstalledRepository.update({ shop: shopInstall.shop }, { closeStore: true });
        continue;
      }
      let shopifyShopDetail: IWixShopData;
      try {
        shopifyShopDetail = JSON.parse(shopInfo.shopJson);
      } catch (err) {
        console.log(err);
      }
      if (!shopifyShopDetail) continue;
      try {
        const customerData: any = {
          email: shopifyShopDetail.email,
          created_at: unixTimestamp(),
          install_date: new Date(shopInstall.lastInstalledDate),
          store_created_at: new Date(shopifyShopDetail.created_at),
          store_name: shopifyShopDetail.name,
          store_url: shopifyShopDetail.domain,
          myshopify_domain: shopifyShopDetail.myshopify_domain,
          country: shopifyShopDetail.country || '',
          timezone: shopifyShopDetail.timezone || '',
          city: shopifyShopDetail.city || '',
          zipcode: shopifyShopDetail.zip || '',
          shop_owner: shopifyShopDetail.shop_owner,
          shopify_plan: shopifyShopDetail.plan_name,
        };
        await this.customerIoQueue.add(CustomerIOProcess.Register, {
          email: shopifyShopDetail.email,
          shop,
          data: customerData,
        });
      } catch (err) {
        console.log(err);
      }
    }
  }
}
