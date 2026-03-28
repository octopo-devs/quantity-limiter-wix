import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as qs from 'qs';
import { WIX_CONFIG } from 'src/shared/api/configs/wix.api.config';
import { AnalyticApiService } from 'src/shared/api/services/analytics-api.service';
import { WixApiService } from 'src/shared/api/services/wix-api.service';
import { PricingPlan } from 'src/shared/api/types/wix-api/wix-api.enum';
import { IAppInstanceResponse, ISiteProperties } from 'src/shared/api/types/wix-api/wix-api.interface';
import { EventEmitterName } from 'src/shared/common/types/shared.enum';
import { UpdateReportAction } from '../admin/types/admin.enum';
import { ShopService } from '../shop/shop.service';
import { GetProductsDto, IWixPaging, WixAppDto } from './dto/wix.dto';
import { IAppInstallEventPayload, IWixCollectionResponse, IWixProductResponse, WixAppInstance } from './types/wix.interface';
import { safeJsonParse } from 'src/shared/common/utils/functions';
import { DateShopGeneral } from 'src/modules/shop/types/shop.enum';

@Injectable()
export class WixService {
  constructor(
    private readonly analyticApiService: AnalyticApiService,
    private readonly wixApiService: WixApiService,
    private readonly shopService: ShopService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  redirectApp(query): { url: string } {
    const querystring = qs.stringify({
      token: query.token,
      appId: process.env.APP_ID,
      redirectUrl: process.env.AUTHORIZATION_REDIRECT_URL,
    });
    const url = `${WIX_CONFIG.REDIRECT_URL}?${querystring}`;
    return { url };
  }

  async handleGetTokenAndRedirect(wixPayload: WixAppDto): Promise<{ url: string }> {
    const { instanceId: shop, code } = wixPayload;
    const shopInfo = await this.shopService.findOneShopInfo({ where: { shop } });
    const dateLocale = safeJsonParse(shopInfo?.shopJson)?.language || DateShopGeneral.DateLocale;
    if (shopInfo) {
      const shopInstalled = await this.shopService.findOneShopInstalled({ where: { shop } });
      if (shopInstalled?.closeStore)
        await this.shopService.updateShopInstall(
          { shop },
          { closeStore: false, dateUninstalled: null, uninstalled: false },
        );
    }

    const result = await this.wixApiService.getWixAccessToken('authorization_code', code);
    const { refresh_token, access_token } = result;
    const appInstance: IAppInstanceResponse = await this.wixApiService.callWixServices('GET', 'APP_INSTANCE', {}, shop);
    const siteData: ISiteProperties = await this.wixApiService.callWixServices('GET', 'SHOP_DETAIL', {}, shop);

    const instance: WixAppInstance = appInstance?.instance || null;
    let plan: PricingPlan;

    if (instance?.billing) {
      const isExpired = instance?.billing?.expirationDate
        ? new Date().getTime() > new Date(instance?.billing?.expirationDate).getTime()
        : true;
      if (!isExpired) plan = instance?.billing?.packageName as PricingPlan;
      if (!Object.values(PricingPlan).includes(plan)) plan = PricingPlan.Free;
    }

    const createShopEventPayload: IAppInstallEventPayload = {
      shop,
      refreshToken: refresh_token,
      appInstance,
      siteData,
      plan,
      dateLocale,
    };

    await this.eventEmitter.emitAsync(EventEmitterName.AppInstall, createShopEventPayload);
    this.eventEmitter.emit(EventEmitterName.ReportUpdate, {
      shop,
      date: new Date(),
      action: UpdateReportAction.INSTALL,
    });

    await this.wixApiService.confirmInstalled(access_token);

    try {
      await this.createScriptVariable(shop);
    } catch (err) {
      console.log(err);
    }

    const url = `https://www.wix.com/installer/close-window?access_token=${access_token}`;
    return { url };
  }

  async createScriptVariable(instanceId: string) {
    try {
      await this.wixApiService.callWixServices(
        'POST',
        'CREATE_SCRIPT',
        {
          properties: {
            parameters: { instanceId },
          },
        },
        instanceId,
      );
      await this.shopService.updateShopGeneral({ shop: instanceId, hasScript: true });
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async handleGetProducts(query: GetProductsDto): Promise<IWixProductResponse> {
    const paging: IWixPaging = {
      limit: undefined,
      offset: undefined,
    };
    let limit = 100;
    if (query.perPage !== -1) limit = query.perPage;
    paging.limit = limit;
    paging.offset = (query.page - 1) * limit;

    const params: any = {
      paging,
    };

    if (query.filter || query.specificIds || query.title) {
      const filterConditions = typeof query.filter === 'object' ? query.filter : {};
      let filter: any = { ...filterConditions };

      if (query.title) {
        filter.$or = [
          { name: { $startsWith: query.title } },
          { id: { $hasSome: [query.title] } },
        ];
      }

      if (query.specificIds) {
        filter.id = { $hasSome: query.specificIds.split(',') };
      }

      params.filter = JSON.stringify(filter);
    }

    if (query.sortDirection !== undefined) params.sort = query.sortDirection;

    try {
      return await this.wixApiService.callWixServices(
        'POST',
        'PRODUCTS_V1',
        { query: params, includeVariants: true },
        query.shop,
      );
    } catch (error) {
      console.log(error);
      return { products: [], metadata: { items: 0, offset: 0 }, totalResults: 0 };
    }
  }

  async handleGetCollections(query: import('./dto/wix.dto').GetCollectionsWixDto): Promise<IWixCollectionResponse> {
    const paging: IWixPaging = {
      limit: undefined,
      offset: undefined,
    };
    let limit = 100;
    if (query.perPage !== -1) limit = query.perPage;
    paging.limit = limit;
    paging.offset = (query.page - 1) * limit;

    const params: any = { paging };

    if (query.name) {
      params.filter = JSON.stringify({
        name: { $startsWith: query.name },
      });
    }

    try {
      return await this.wixApiService.callWixServices(
        'POST',
        'COLLECTIONS_V1',
        { query: params },
        query.shop,
      );
    } catch (error) {
      console.log(error);
      return { collections: [], metadata: { items: 0, offset: 0 }, totalResults: 0 };
    }
  }

  //test
  getAppPricingPlans(shop: string) {
    return this.wixApiService.callWixServices('GET', 'PUBLIC_PRICING_PLAN', { param: process.env.APP_ID || '' }, shop);
  }
}
