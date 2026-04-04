import { IRule } from './nest-types/modules/rule/types/rule.entity';
import { IShopifyAppMetafieldPayload } from './nest-types/shared/api/types/shopify-api/shopify-api.interface';
import { IWixPage, IWixProductData, IWixVariant } from './wix.interface';

export interface IRuleLog {
  show: IRule[];
  hide: {
    notEnabled: IRule[];
    productExcludeCheck: IRule[];
    collectionExcludeCheck: IRule[];
    vendorExcludeCheck: IRule[];
    locationExcludeCheck: IRule[];
    SKUExcludeCheck: IRule[];
    inventoryQuantityIncludeCheck: IRule[];
    inventoryLocationExcludeCheck: IRule[];
    tagExcludeCheck: IRule[];
    productMetafieldExcludeCheck: IRule[];
    variantMetafieldExcludeCheck: IRule[];
    exceptionProductIncludeCheck: IRule[];
    notMatchedAnyIncludeCondition: IRule[];
    hideCountryRuleNotDetected: IRule[];
    soldOut: IRule[];
  };
}

export const DEFAULT_RULE_LOG: IRuleLog = {
  show: [],
  hide: {
    notEnabled: [],
    productExcludeCheck: [],
    collectionExcludeCheck: [],
    vendorExcludeCheck: [],
    locationExcludeCheck: [],
    SKUExcludeCheck: [],
    inventoryQuantityIncludeCheck: [],
    inventoryLocationExcludeCheck: [],
    tagExcludeCheck: [],
    productMetafieldExcludeCheck: [],
    variantMetafieldExcludeCheck: [],
    exceptionProductIncludeCheck: [],
    notMatchedAnyIncludeCondition: [],
    hideCountryRuleNotDetected: [],
    soldOut: [],
  },
};

declare global {
  interface Window {
    // Wix platform APIs
    wixDevelopersAnalytics: {
      register: (appId: string, callback: (eventName: string, data: any) => void) => any;
      triggerEvent: (eventName: string, data: any) => void;
    };
    wixEmbedsAPI: {
      getLanguage: () => string;
    };

    // App registration state
    isEstRegistered: boolean;

    // Page & product state (set by analytics event handlers)
    estimatedCurrentPage: IWixPage;
    estimatedCurrentProduct: IWixProductData;
    estimatedCurrentCollectionIds: string[];
    estimatedCurrentRibbon: string;
    estimatedPrevProductId?: string;
    estimatedProductVariants: IWixVariant[];
    estimatedSelectedVariant?: IWixVariant;
    estimatedQuantityOnPage?: number;

    // App config
    estimatedShop: string;
    estimatedAppMetafields: IShopifyAppMetafieldPayload;
    estimatedDetectedLanguageCode?: string;
    estimatedRuleLog: IRuleLog;
    estimatedIsApiCalled: {
      locationInfo: boolean;
      allCountries: boolean;
    };
    __OL_INSTANCE_ID?: string;

    // Session tracking
    estimatedVisitorId?: string;

    // Cart state
    estimatedCartId?: string;
    estimatedCartRefresh?: () => void;
    estimatedCartClear?: () => void;

    // Re-render trigger
    estimatedReInitApp: () => void;
  }
}
