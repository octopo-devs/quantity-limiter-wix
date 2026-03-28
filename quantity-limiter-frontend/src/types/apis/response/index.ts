import { Plan } from '@/types/enum';
import { IParamsApi } from '../params';

export namespace IResponseApi {
  export interface ICommon {
    code: number;
    status: string;
    message: string;
  }

  export interface IPaginate {
    pagination: {
      count: number;
      current_page: number;
      per_page: number;
      total: number;
      total_pages: number;
    };
  }

  export interface ICountry {
    id: number;
    shop: string;
    country_id: string;
    name: string;
    code: string;
    provinces: string;
  }

  export interface IGeneralSettingsData
    extends Omit<IParamsApi.IUpdateGeneralSetting, 'week_working_days' | 'specific_day_off'> {
    id: number;
    week_working_days: string;
    specific_day_off: string;
  }

  export interface IGeneralSettings {
    data: IGeneralSettingsData;
    code: number;
    status: string;
  }

  export interface IShopInfo {
    code: number;
    status: string;
    data: {
      country: string;
      email: string;
      shop: string;
      shopName: string;
      siteUrl: string;
      lastInstalledDate: string;
    };
  }

  export interface IEmbeddedAppStatus {
    code: number;
    status: string;
    message: string;
    data: {
      disabled: boolean;
    };
  }

  export interface IProductItem {
    id: number;
    shop: string;
    product_id: number;
    title: string;
    body_html: string;
    vendor: string;
    product_type: string;
    handle: string;
    published_at: string;
    template_suffix: string;
    status: string;
    published_scope: string;
    tags: string;
    admin_graphql_api_id: string;
    variants: string;
    options: string;
    images: string;
    image: string;
    seo: string;
    created_at: string;
    updated_at: string;
  }

  export interface ICommonGetOption<T> {
    data: Array<T>;
    meta: IPaginate;
    code: number;
    status: string;
    message: string;
  }

  export type IGetProducts = ICommonGetOption<IProductItem>;
  export type IGetCollections = ICommonGetOption<ICollectionItem>;
  export type IGetProductSKUs = ICommonGetOption<IProductSKU>;
  export type IGetProductTags = ICommonGetOption<IProductTag>;
  export type IGetInventoryLocation = ICommonGetOption<IInventoryLocation>;
  export type IGetProductMetafield = ICommonGetOption<IProductMetafield>;

  export interface IProductSKU {
    id: number;
    shop: string;
    product_sku: string;
  }

  export interface IProductTag {
    id: number;
    shop: string;
    product_tag: string;
  }

  export interface IInventoryLocation {
    id: number;
    shop: string;
    product_tag: string;
    location_name: string;
    shop_location_id: string;
  }

  export interface IProductMetafield {
    key: string;
    value: string[];
    label: string;
  }

  export interface ICollectionItem {
    id: number;
    shop: string;
    collection_id: number;
    body_html: string;
    handle: string;
    image: string;
    published_at: string;
    published_scope: string;
    rules: string;
    disjunctive: boolean;
    sort_order: string;
    template_suffix: string;
    title: string;
    products: string;
  }

  export interface IGetVendors {
    data: Array<string>;
    code: number;
    status: string;
    message: string;
  }
  export interface IListCountry {
    data: ICountry;
    code: number;
    status: string;
    message: string;
  }

  export interface IProvince {
    code: string;
    id?: number;
    name: string;
  }

  export interface ILocationCountry {
    id: number;
    name: string;
    isoCode: string;
    flag: string;
    phonecode: string;
    currency: string;
    latitude: string;
    longitude: string;
  }

  export interface IGetLocationCountries {
    state: number;
    msg: string;
    data: {
      result: ILocationCountry[];
      currentPage: number;
      perPage: number;
      totalPage: number;
      totalResult: number;
    };
  }

  export interface ILocationState {
    id: number;
    name: string;
    isoCode: string;
    countryCode: string;
    latitude: string;
    longitude: string;
  }

  export interface IGetLocationStates {
    state: number;
    msg: string;
    data: {
      result: ILocationState[];
      currentPage: number;
      perPage: number;
      totalPage: number;
      totalResult: number;
    };
  }

  export interface ICheckIpLocation {
    state: number;
    msg: string;
    data: {
      ip: string;
      country_code: string;
      country_name: string;
      region_name: string;
      city_name: string;
      latitude: number;
      longitude: number;
      zip_code: string;
      time_zone: string;
    };
  }

  export interface ITargetGroupItem {
    items: Array<string>;
    infos: Array<{ target_id: string; title: string }>;
  }
  export interface IGetAppPricing {
    code: number;
    status: string;
    message: string;
    data: {
      id: number;
      displayName: string;
      monthlyDescription: string;
      annuallyDescription: string;
      plan: Plan;
      price: number;
      annuallyDiscount: number;
      annuallyMonthlyDisplayPrice: number;
      annuallyPrice: number;
      tag: string;
      trialDays?: number;
    }[];
  }

  export interface IGetUrlUpdatePlan {
    code: number;
    status: string;
    message: string;
    data?: {
      url: string;
    };
  }

  export interface IGetCountRules {
    code: number;
    status: string;
    message: string;
    data: {
      count: number;
      countShipping: number;
      countZipcode: number;
      countCountry: number;
      countShippingSpecific: number;
      countZipcodeSpecific: number;
      countCountrySpecific: number;
      countRule: number;
    };
  }

  export interface IShopDiscountRes extends ICommon {
    data: {
      code: string;
      discountValue?: number;
      fixedPrice?: number;
      plansApply: string;
      trialDays: number;
    };
  }

  export interface IUnionData {
    id: number;
    name: string;
    code: string;
    countryCodes: string;
  }
  export interface IUnionRes {
    state: number;
    totalResult: number;
    currentPage: number;
    perPage: number;
    totalPage: number;
    data: {
      result: IUnionData[];
    };
  }

  export interface IShopShipping extends ICommon {
    data: string[];
  }

  export interface ICheckoutRule {
    id: number;
    shop: string;
    name: string;
    shippingMethods: string;
    enable: boolean;
    minPreparationDays: number;
    maxPreparationDays: number;
    minDeliveryDays: number;
    maxDeliveryDays: number;
    messageText: string;
    iconId: number;
    createdAt: string;
    updatedAt: string;
  }

  export interface IGetDetailCheckoutRule extends ICommon {
    data: ICheckoutRule;
  }

  export interface IGetCheckoutRules extends ICommon {
    data: ICheckoutRule[];
    meta: {
      pagination: {
        count: number;
        current_page: number;
        links: Record<string, never>;
        per_page: number;
        total: number;
        total_pages: number;
      };
    };
  }

  export interface ICheckoutAppearance {
    shop?: string;
    id?: number;
    labelText: string;
    isShowShippingMethodName: boolean;
    isEnableCartLine: boolean;
  }

  export interface IGetDetailCheckoutAppearance extends ICommon {
    data: ICheckoutAppearance;
  }

  export interface IGetShopCheckoutId extends ICommon {
    data: { id: number };
  }

  export interface IGetRules extends ICommon {
    meta: IPaginate;
  }

  export interface IRuleCondition {
    products: {
      name: string;
      variants: string[];
    }[];
    productMetafields: {
      name: string;
      value: string[];
    }[];
    variantMetafields: {
      name: string;
      value: string[];
    }[];
    exceptions: {
      name: string;
      variants: string[];
    }[];
    collections: string[];
    brands: string[];
    name: string;
    type: 'all' | 'applied' | 'excluded';
    countries: {
      name: string;
      states: string[];
    }[];
    zipcodes: string[];
    SKUs: string[];
    inventoryLocations: { name: string }[];
    inventoryQuantities: string[];
    tags: string[];
  }

  export interface IAnalytic {
    id: number;
    shop: string;
    ruleId: number;
    createdAt: string;
    totalVisitorsProductPage: number;
    totalBannerImpressions: number;
    totalHoverBannerETA: number;
    totalBannerClicks: number;
    totalAddToCart: number;
  }

  export interface IGetConditionDetail extends ICommon {
    data: IRuleCondition;
    meta: IPaginate;
  }

  export interface IGetAnalytic extends ICommon {
    data: IAnalytic[];
  }

  export interface IProductAnalytic {
    ruleId: number;
    ruleName: string;
    totalProducts: number;
    isAllProducts?: boolean;
  }

  export interface IGetProductAnalytic extends ICommon {
    appliedProducts: IProductAnalytic[];
    totalActiveRules: number;
  }
  export interface IGetBlackoutHolidays {
    kind: string;
    etag: string;
    summary: string;
    description: string;
    updated: string;
    timeZone: string;
    accessRole: string;
    defaultReminders: never[];
    nextSyncToken: string;
    items: IBlackout[];
  }

  export interface IBlackout {
    kind: string;
    etag: string;
    id: string;
    status: string;
    htmlLink: string;
    created: string;
    updated: string;
    summary: string;
    description: string;
    creator: {
      email: string;
      displayName: string;
      self: boolean;
    };
    organizer: {
      email: string;
      displayName: string;
      self: boolean;
    };
    start: {
      date: string;
    };
    end: {
      date: string;
    };
    transparency: string;
    visibility: string;
    iCalUID: string;
    sequence: number;
    eventType: string;
  }

  export interface IRedirectUpdateShopScope extends ICommon {
    data: {
      url: string;
    };
  }

  export interface IShopifyLanguage {
    locale: string;
    primary: boolean;
    published: boolean;
  }

  export interface IGetShopifyLanguages {
    code: number;
    data: IShopifyLanguage[];
  }
}
