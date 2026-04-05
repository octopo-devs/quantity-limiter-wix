import { IShopifyAppMetafieldPayload } from './nest-types/shared/api/types/shopify-api/shopify-api.interface';
import { IWixCartEventData, IWixPage, IWixProductData, IWixVariant } from './wix.interface';

type WixEventData = IWixPage | IWixProductData | IWixCartEventData;

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

    // Page & product state (set by analytics event handlers)
    qlCurrentPage: IWixPage;
    qlCurrentProduct: IWixProductData;
    qlCurrentCollectionIds: string[];
    qlCurrentRibbon: string;
    qlPrevProductId?: string;
    qlProductVariants: IWixVariant[];
    qlSelectedVariant?: IWixVariant;
    qlQuantityOnPage?: number;

    // App config
    qlShop: string;
    qlAppMetafields: IShopifyAppMetafieldPayload;
    qlDetectedLanguageCode?: string;
    __OL_INSTANCE_ID?: string;

    // Session tracking
    qlVisitorId?: string;

    // Cart state
    qlCartId?: string;
    qlCartRefresh?: () => void;
    qlCartClear?: () => void;

    // Re-render trigger
    qlReInitApp: () => void;
  }
}
