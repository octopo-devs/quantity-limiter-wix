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
    test: any;
    wixDevelopersAnalytics: {
      register: (e, t) => any;
      triggerEvent: (e, t) => void;
    };
    isEstRegistered: boolean;
    wixEmbedsAPI: {
      getLanguage: () => string;
    };

    qlCurrentPage: IWixPage;
    qlCurrentProduct: IWixProductData;
    qlCurrentCollectionIds: string[];
    qlCurrentRibbon: string;
    qlPrevProductId?: string;
    qlProductVariants: IWixVariant[];
    qlShop: string;
    qlAppMetafields: IShopifyAppMetafieldPayload;
    qlSelectedVariant?: IWixVariant;
    qlDetectedLanguageCode?: string;
    qlRuleLog: IRuleLog;
    qlReInitApp: () => void;
    qlIsApiCalled: {
      locationInfo: boolean;
      allCountries: boolean;
    };
    qlQuantityOnPage: number;
    qlCartId?: string;
    qlCartRefresh?: () => void;
    qlCartClear?: () => void;
    __OL_INSTANCE_ID?: string;
  }
}
