import { Ga4Event, Plan, SortDirection, Subscription } from '@/types/enum';

export namespace IParamsApi {
  export interface IZipcodeSetting {
    id: number;
    shop: string;
    inputLabel: string;
    inputPlaceholder: string;
    submitButton: string;
    submitButtonBackgroundColor: string;
    submitButtonTextColor: string;
    zipcodeAvailableText: string;
    zipcodeNotAvailableText: string;
  }

  export interface IWeekWorkingDay {
    enable: number;
    day: number;
    cut_off_after: string;
  }

  export enum DetectionMethod {
    ShopLocale = 'shop_locale',
    IPAddress = 'ip_address',
    Url = 'url',
    BrowserLanguage = 'browser_language',
  }

  export interface IUpdateGeneralSetting {
    shop: string;
    plan: Plan;
    subscription: Subscription;
    confirmationUrl: string;
    planUpdatedAt: number;
    displayOnboarding: boolean;
  }

  export enum IConditionShowCheckoutRule {
    EarliestMinPrepare = 'earliest_min_preparation_date',
    LongestMinPrepare = 'longest_min_preparation_date',
    EarliestMaxPrepare = 'earliest_max_preparation_date',
    LongestMaxPrepare = 'longest_max_preparation_date',
    EarliestMinDelivery = 'earliest_min_delivery_date',
    LongestMinDelivery = 'longest_min_delivery_date',
    EarliestMaxDelivery = 'earliest_max_delivery_date',
    LongestMaxDelivery = 'longest_max_delivery_date',
  }

  export interface IDataSettingTimelineIcon {
    iconUrl?: string;
    isCustom?: boolean;
    iconId?: number;
    iconFile?: string;
  }

  export interface IUpdateOnboarding {
    isAgreeConsent: boolean;
    email: string;
  }

  export interface ICommon {
    name?: string;
    label?: string;
    page: number;
    perPage: number;
    collectionIds?: string;
    brands?: string;
    includeProductIds?: string;
    sortDirection?: SortDirection;
    includeCollectionIds?: string;
    includeLocationIds?: string;
    includeProductTags?: string;
    includeProductSKUs?: string;
    includeProductMetafieldKey?: string;
    includeVariantMetafieldKey?: string;
  }

  export interface IGetLocationCountries {
    countryIds?: string;
    search?: string;
    page?: number;
    perPage: number;
  }

  export interface IGetLocationStates {
    stateIds?: string;
    search?: string;
    countryCode?: string;
    page?: number;
    perPage: number;
  }

  export interface IUpdatePlan {
    subscription: Subscription;
    plan: Plan;
  }

  export interface ISendGA4Event {
    event: Ga4Event;
    plan?: Plan;
    type?: Subscription;
  }

  export interface IUpdateMultipleRule {
    ids: number[];
    shop?: string;
    enable?: boolean;
    show_text_in_cart?: boolean;
  }

  interface IItemOfFieldOfMapping {
    id: string;
    name: string;
  }

  export interface IVariantsProduct {
    idProduct: string;
    variants: {
      id: string;
      name: string;
    }[];
    totalVariants?: number;
  }

  export interface IItemMapping {
    collections: IItemOfFieldOfMapping[];
    exceptionProductsCollection: IItemOfFieldOfMapping[];
    exceptionProductsVendor: IItemOfFieldOfMapping[];
    products: IItemOfFieldOfMapping[];
    brands: IItemOfFieldOfMapping[];
  }

  export interface ISelectOptions {
    value: string;
    label: string;
  }

  export interface ICannyResponse extends ICommon {
    data: {
      token: string;
    };
  }

  export interface IUnionParams {
    name?: string;
    code?: string;
    includeCountry?: boolean;
  }

  export interface IGetCheckoutRules {
    page: number;
    perPage: number;
    sortDirection?: SortDirection;
    shippingMethods?: string;
  }

  export interface IBlackoutParams {
    countryCode: string;
    year: number;
  }

  export interface IGetAnalytic {
    startDate: string;
    endDate: string;
    refetch?: number;
  }
}
