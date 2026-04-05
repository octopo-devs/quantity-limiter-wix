import { IShopifyAppMetafieldPayload } from './nest-types/shared/api/types/shopify-api/shopify-api.interface';
import { IWixPage, IWixProductData, IWixVariant } from './wix.interface';

export interface QlProductData {
  id: string;
  name: string;
  price: number;
  weight?: number;
  sku?: string;
  collections: string[];
  variants: IWixVariant[];
  ribbon: string;
}

export interface QlCurrentProduct {
  id: string;
  quantity: number;
  selectedVariantId?: string;
}

type WixEventData = IWixPage | IWixProductData;

declare global {
  interface Window {
    // Wix platform APIs
    wixDevelopersAnalytics: {
      register: (appId: string, callback: (eventName: string, data: WixEventData) => void) => void;
      triggerEvent: (eventName: string, data: WixEventData) => void;
    };
    wixEmbedsAPI: {
      getLanguage: () => string;
    };

    // App registration state
    isEstRegistered: boolean;

    // Product data cache (keyed by productId)
    qlProducts: Map<string, QlProductData>;

    // Current product interaction state
    qlCurrentProduct?: QlCurrentProduct;

    // Page state
    qlCurrentPage: IWixPage;

    // App config
    qlShop: string;
    qlAppMetafields: IShopifyAppMetafieldPayload;
    qlDetectedLanguageCode?: string;
    __OL_INSTANCE_ID?: string;

    // Session tracking
    qlVisitorId?: string;

    // Re-render trigger
    qlTriggerRerender: () => void;
  }
}
