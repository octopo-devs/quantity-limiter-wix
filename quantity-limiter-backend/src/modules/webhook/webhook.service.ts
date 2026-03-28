import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ShopService } from 'src/modules/shop/shop.service';
import {
  IWebhookCollectionV1Removed,
  IWebhookCollectionV1Updated,
  IWebhookPayload,
  IWebhookPlanUpdate,
  IWebhookProductV1Removed,
  IWebhookProductV1Updated,
} from 'src/modules/wix/types/wix.interface';
import { AnalyticApiService } from 'src/shared/api/services/analytics-api.service';
import { WixApiService } from 'src/shared/api/services/wix-api.service';
import { Ga4Event } from 'src/shared/api/types/analytics-api/analytics-api.enum';
import { IAppInstanceResponse } from 'src/shared/api/types/wix-api/wix-api.interface';
import { EventEmitterName } from 'src/shared/common/types/shared.enum';
import { formatDateString } from 'src/shared/common/utils/functions';
import { AdminService } from '../admin/admin.service';
import { UpdateReportAction } from '../admin/types/admin.enum';
import { PRICING_PLANS_MAPPING, WIX_WEBHOOK_TOPICS } from '../wix/types/wix.constant';
import { CustomCacheService } from 'src/shared/custom-cache/custom-cache.service';
@Injectable()
export class WebhookService {
  constructor(
    private readonly analyticApiService: AnalyticApiService,
    private readonly eventEmitter: EventEmitter2,
    private readonly adminService: AdminService,
    private readonly wixApiService: WixApiService,
    private readonly shopService: ShopService,
    private readonly customCacheService: CustomCacheService,
  ) {}

  async handlePlanUpdate(payload: IWebhookPayload) {
    const { data, eventType, instanceId: shop } = payload;

    const shopGeneral = await this.shopService.findOneShopGeneral({ where: { shop } });
    if (!shopGeneral) return false;

    const appInstance: IAppInstanceResponse = await this.wixApiService.callWixServices('GET', 'APP_INSTANCE', {}, shop);
    const { isFree, billing } = appInstance.instance;
    const { expirationDate } = billing;

    const { vendorProductId, cycle: subscription } = data as IWebhookPlanUpdate;
    const plan = PRICING_PLANS_MAPPING[vendorProductId] || vendorProductId;
    const planExpiredAt = new Date(expirationDate) || null;

    await this.eventEmitter.emitAsync(EventEmitterName.PlanPurchase, {
      shop,
      plan,
      subscription: subscription?.toLowerCase(),
      oldPlan: shopGeneral?.plan,
      planExpiredAt,
      eventType,
      isFree,
    });
  }

  async handleWixWebhook(payload: IWebhookPayload) {
    const { data, eventType, instanceId: shop } = payload;
    const cacheKey = eventType + shop + JSON.stringify(data);
    const cacheTime = 60 * 1000;
    console.log('eventType', eventType);

    try {
      const dataCached = await this.customCacheService.get(cacheKey);
      if (dataCached) return;
      await this.customCacheService.set(cacheKey, true, cacheTime);
      switch (eventType) {
        case WIX_WEBHOOK_TOPICS.PAID_PLAN_CHANGED:
        case WIX_WEBHOOK_TOPICS.PAID_PLAN_AUTO_RENEW_CANCELLED:
        case WIX_WEBHOOK_TOPICS.PAID_PLAN_PURCHASED: {
          this.handlePlanUpdate(payload);
          break;
        }
        case WIX_WEBHOOK_TOPICS.SITE_PROPERTY_UPDATED: {
          await this.eventEmitter.emitAsync(EventEmitterName.ShopUpdate, { shop, payload: data });
          break;
        }
        case WIX_WEBHOOK_TOPICS.APP_REMOVED: {
          const dateString = formatDateString();
          await this.adminService.updateAdminDailyUninstallLog(true, shop, dateString);
          await this.eventEmitter.emitAsync(EventEmitterName.AppUninstall, { shop, payload: data });
          this.eventEmitter.emit(EventEmitterName.ReportUpdate, {
            shop,
            date: new Date(),
            action: UpdateReportAction.UNINSTALL,
          });
          this.analyticApiService.sendEventGa4(Ga4Event.Uninstall, { shop_name: shop });
          break;
        }

        case WIX_WEBHOOK_TOPICS.PRODUCT_CHANGE_V1:
        case WIX_WEBHOOK_TOPICS.PRODUCT_CREATED_V1: {
          await this.eventEmitter.emitAsync(EventEmitterName.ProductUpdate, {
            shop,
            productId: (data as IWebhookProductV1Updated)?.productId,
          });
          break;
        }
        case WIX_WEBHOOK_TOPICS.PRODUCT_DELETED_V1: {
          const { productId } = data as IWebhookProductV1Removed;
          await this.eventEmitter.emitAsync(EventEmitterName.ProductRemove, { shop, id: productId });
          break;
        }

        // case WIX_WEBHOOK_TOPICS.PRODUCT_UPDATED_V3:
        // case WIX_WEBHOOK_TOPICS.PRODUCT_CREATED_V3: {
        //   console.log('data', eventType, data);
        //   // await this.eventEmitter.emitAsync(EventEmitterName.ProductUpdate, { shop, products: [request.body] });
        //   break;
        // }
        // case WIX_WEBHOOK_TOPICS.PRODUCT_DELETED_V3: {
        //   console.log('data', eventType, data);
        //   // await this.eventEmitter.emitAsync(EventEmitterName.ProductUpdate, { shop, products: [request.body] });
        //   break;
        // }

        case WIX_WEBHOOK_TOPICS.COLLECTION_CREATED_V1:
        case WIX_WEBHOOK_TOPICS.COLLECTION_CHANGED_V1: {
          const { collectionId } = data as IWebhookCollectionV1Updated;
          await this.eventEmitter.emitAsync(EventEmitterName.CollectionUpdate, { shop, collectionId });
          break;
        }
        case WIX_WEBHOOK_TOPICS.COLLECTION_DELETED_V1: {
          const { collectionId } = data as IWebhookCollectionV1Removed;
          await this.eventEmitter.emitAsync(EventEmitterName.CollectionRemove, { shop, id: collectionId });
          break;
        }

        // case WIX_WEBHOOK_TOPICS.PRODUCT_VARIANT_CHANGE_V1:
        // case WIX_WEBHOOK_TOPICS.PRODUCT_VARIANT_ADDED_V3:
        // case WIX_WEBHOOK_TOPICS.PRODUCT_VARIANT_UPDATED_V3: {
        //   console.log('data', eventType, data);
        //   // await this.eventEmitter.emitAsync(EventEmitterName.ProductUpdate, { shop, products: [request.body] });
        //   break;
        // }
        // case WIX_WEBHOOK_TOPICS.BRAND_UPDATED_V3:
        // case WIX_WEBHOOK_TOPICS.BRAND_CREATED_V3: {
        //   console.log('data', eventType, data);
        //   // await this.eventEmitter.emitAsync(EventEmitterName.ProductUpdate, { shop, products: [request.body] });
        //   break;
        // }
        // case WIX_WEBHOOK_TOPICS.BRAND_DELETED_V3: {
        //   console.log('data', eventType, data);
        //   // await this.eventEmitter.emitAsync(EventEmitterName.ProductUpdate, { shop, products: [request.body] });
        //   break;
        // }

        // case WIX_WEBHOOK_TOPICS.PRODUCT_VARIANT_REMOVE_V3: {
        //   console.log('data', eventType, data);
        //   // await this.eventEmitter.emitAsync(EventEmitterName.ProductUpdate, { shop, products: [request.body] });
        //   break;
        // }
        default: {
          console.log('Topic not found', shop, eventType, JSON.stringify(data));
          break;
        }
      }
    } catch (err) {
      if (!err.message.includes('Duplicate entry')) console.log(err);
    }
    return { status: 'success' };
  }
}
