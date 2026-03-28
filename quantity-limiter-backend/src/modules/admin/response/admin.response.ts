import { DefaultPaginationResponse, DefaultResponse } from 'src/docs/default/default-response.swagger';
import { AdminDailyLog } from '../entities/admin-daily-log.entity';
import { IWixShopData } from 'src/modules/wix/types/wix.interface';
import { ShopGeneral } from 'src/modules/shop/entities/shop-general.entity';
import { AppPerformanceLog } from '../entities/admin-performance-log.entity';
import { PricingPlan } from 'src/shared/api/types/wix-api/wix-api.enum';

export class AdminSummaryResponse extends DefaultResponse {
  data: {
    summaryData: AdminDailyLog[];
    featureUsage: FeatureUsageResponse;
    topCountry: CountryNameResponse[];
    dataTransfer: DataTransferResponse;
    retentionRate: string;
    paidByCountry: PaidByCountryResponse[];
    shopCategory: ShopCategoryResponse[];
  };
}

export class PaidByCountryResponse {
  country: string;
  count: number;
}

export class ShopCategoryResponse {
  category: string;
  count: number;
}

export class GetAdminDailyUninstallLogResponse extends DefaultResponse {
  data: ResultAdminDailyUninstallLog[];
}

export class ResultAdminDailyUninstallLog {
  date: string;
  shopWebhook: dataUninstall[];
  shopEvent: dataUninstall[];
}

export class dataUninstall {
  shop: string;
  count: number;
}
export class CreateAppPerformanceLogResponse extends DefaultResponse {
  data: { appPerformanceLog: AppPerformanceLog };
}

export class GetAppPerformanceLogResponse extends DefaultResponse {
  data: AppPerformanceLog[];
}

export class CountryNameResponse {
  name: string;
  value: number;
}

export class PlanNameResponse {
  name: string;
  [PricingPlan.Free]: { monthly: number; yearly: number };
  [PricingPlan.Standard]: { monthly: number; yearly: number };
  [PricingPlan.Pro]: { monthly: number; yearly: number };
}

export class DataQuantity {
  rule: NumberUsage;
  condition: NumberUsage;
  languageRule: NumberUsage;
}

export class ConditionUsage {
  includeProducts: number;
  includeCollections: number;
  includeBrands: number;
  includeSKUs: number;
  excludeProducts: number;
  excludeCollections: number;
  excludeBrands: number;
  excludeSKUs: number;
  exceptionProducts: number;
  country: number;
  zipCode: number;
  stateProvince: number;
}

export class FeatureUsageResponse {
  ruleAndConditionQuantity: DataQuantity;
  conditionsUsage: ConditionUsage;
  autoDetectPostalCountry: number;
  postalCodeRequired: number;
  customCss: number;
  showOnHome: number;
  showOnProduct: number;
  showOnCollection: number;
  showOnPage: number;
  showOnCart: number;
  shopShowInCart: number;
  shopEnabledSoldOut: number;
  shopCustomTimelineIcon: number;
  shopUseCheckoutFeature: number;
  shopUsingLanguageRule: number;
}

export class UsageRule {
  usage: number;
  allItems: number;
  onlySelected: number;
  excludeSelected: number;
}

export class NumberUsage {
  zero: number;
  one: number;
  two: number;
  three: number;
  greaterThanFour: number;
}

export class SearchUsersAdminResponse extends DefaultPaginationResponse {
  data: UserResponse[];
}

export class UserInfoResponse extends DefaultResponse {
  data: {
    shopGeneral: ShopGeneral;
    shopifyInfo: UserInfoDetailResponse;
  };
}

export class UserResponse {
  id: number;
  shop: string;
  otherUrl?: string;
  shopifyCreatedAt?: Date;
  plan: string;
  subscription?: string;
  lastAccess?: Date;
  firstInstallDate?: Date;
  lastInstallDate?: Date;
  lastAccessDate?: Date;
  uninstalledDate?: Date;
  isUninstall: boolean;
  appUsageDurationOfUninstalledShop: number;
  note?: string;
  enableApp: boolean;
  countRules?: number;
  contact: UserContactResponse;
  latestOnboardingStep: number | null;
  shopifyId?: number;
}

export class UserInfoDetailResponse implements IWixShopData {
  id: number;
  name: string;
  email: string;
  domain: string;
  province: string;
  country: string;
  address1: string;
  zip: string;
  city: string;
  source?: string;
  phone: string;
  latitude: number;
  longitude: number;
  primary_locale: string;
  address2?: string;
  created_at: string;
  updated_at: string;
  country_code: string;
  country_name: string;
  currency: string;
  customer_email: string;
  timezone: string;
  iana_timezone: string;
  shop_owner: string;
  money_format: string;
  money_with_currency_format: string;
  weight_unit: string;
  province_code: string;
  taxes_included: boolean;
  tax_shipping: boolean;
  county_taxes: boolean;
  plan_display_name: string;
  plan_name: string;
  has_discounts: boolean;
  has_gift_cards: boolean;
  myshopify_domain: string;
  google_apps_domain?: string;
  google_apps_login_enabled?: boolean;
  money_in_emails_format: string;
  money_with_currency_in_emails_format: string;
  eligible_for_payments: boolean;
  requires_extra_payments_agreement: boolean;
  password_enabled: boolean;
  has_storefront: boolean;
  eligible_for_card_reader_giveaway: boolean;
  finances: boolean;
  primary_location_id: number;
  cookie_consent_level: string;
  visitor_tracking_consent_preference: string;
  force_ssl: boolean;
  checkout_api_supported: boolean;
  multi_location_enabled: boolean;
  setup_required: boolean;
  pre_launch_enabled: boolean;
  enabled_presentment_currencies: string[];
  language: string;
}

export class UserContactResponse {
  email: string;
  phone: string;
  country: string;
}

export class DashboardGroupPlanResponse extends DefaultResponse {
  data: {
    categories: string[];
    monthlySeries: DashboardActivePlan[];
    annuallySeries: DashboardActivePlan[];
    uninstallMonthlySeries: DashboardActivePlan[];
    uninstallAnnuallySeries: DashboardActivePlan[];
    downgradeSeries: DashboardActivePlan[];
  };
}

export class DataTransferResponse {
  upgrade: number;
  downgrade: number;
}

export class DashboardActivePlan implements Record<PricingPlan, number> {
  basic: number;
  standard: number;
  pro: number;
  plus: number;
}
