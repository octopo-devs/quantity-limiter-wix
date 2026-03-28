import {
  TransactionPaymentStatus,
  WixActivityType,
  WixBillingCycle,
  WixEventType,
  WixFulfilledStatus,
  WixLineItemType,
  WixOrderPaymentStatus,
  WixWeightUnit,
} from '../enum';

export interface IAuthorizationPayload {
  code: string;
  state?: string;
  instanceId: string;
}

export interface IWebhookPayload {
  instanceId: string;
  eventType: WixEventType;
  data:
    | IWebhookAppInstalled
    | IWebhookAppRemoved
    | IWebhookPlanPurchase
    | IWebhookPlanChanged
    | IWebhookPlanCycleCancelled
    | IWebhookSiteUpdated
    | IWebhookOrderUpdate
    | IWebhookPaymentStatusUpdate
    | IWebhookTransactionUpdate
    | IWebhookFulfillmentUpdate
    | IWebhookFulfilledStatusUpdate
    | IWebhookProductV3Updated
    | IWebhookProductV1Updated
    | IWebhookProductV1Removed
    | IWebhookCollectionV1Updated;
}

export interface IWebhookAppInstalled {
  appId: string;
  originInstanceId: string;
}

export interface IWebhookAppRemoved {
  appId: string;
}

export interface IWebhookPlanPurchase {
  operationTimeStamp: string;
  vendorProductId: string;
  cycle: WixBillingCycle;
  expiresOn: string;
  couponName?: string;
  invoiceId?: string;
}

export interface IWebhookPlanChanged {
  operationTimeStamp: string;
  vendorProductId: string;
  cycle: WixBillingCycle;
  previousVendorProductId: string;
  previousCycle: WixBillingCycle;
  couponName?: string;
  invoiceId?: string;
}

export interface IWebhookPlanCycleCancelled {
  operationTimeStamp: string;
  vendorProductId: string;
  cycle: WixBillingCycle;
  cancelReason: string;
  userReason: string;
  subscriptionCancellationType: string;
}

export interface IWebhookProductV1Updated {
  productId: string;
  changedFields: string[];
  revision: string;
  originatedFromVersion: string;
}

export interface IWebhookCollectionV1Updated {
  collectionId: string;
  changedFields: string[];
  originatedFromVersion: string;
}

export interface IWebhookProductV1Removed {
  productId: string;
}

export interface IWebhookCollectionV1Removed {
  collectionId: string;
}

export interface IWebhookProductV3Updated {
  id: string;
  entityFqdn: string;
  slug: string;
  entityId: string;
  updatedEvent: {
    currentEntityAsJson: IWixProduct;
    modifiedFields: {
      [key: string]: string | null | boolean;
    };
  };
  eventTime: string;
  triggeredByAnonymizeRequest: boolean;
  entityEventSequence: string;
}

export interface IWixCategory {
  primary: string;
  secondary: string[];
  businessTermId: string;
}

export interface IWixBusinessSchedule {
  periods: {
    openDay: string;
    openTime: string;
    closeDay: string;
    closeTime: string;
  }[];
  specialHourPeriod: {
    startDate: string;
    endDate: string;
    isClosed: boolean;
    comment: string;
  }[];
}

export interface IWixSupportedLanguage {
  languageCode: string;
  locale: {
    languageCode: string;
    country: string;
  };
  isPrimary: boolean;
  countryCode: string;
  resolutionMethod: 'SUBDIRECTORY' | 'SUBDOMAIN' | 'QUERY_PARAM';
}

export interface IWebhookSiteUpdated {
  metasiteId: string;
  event: {
    version: string;
    fields: {
      paths: string[];
    };
    properties: {
      categories?: IWixCategory;
      locale?: {
        languageCode: string;
        country: string;
      };
      language?: string;
      paymentCurrency?: string;
      timeZone?: string;
      email?: string;
      phone?: string;
      fax?: string;
      address?: {
        country: string;
        city: string;
        street: string;
        state: string;
        zip: string;
        hint: { text: string; placement: 'REPLACE' | 'AFTER' | 'BEFORE' };
        isPhysical: boolean;
        googleFormattedAddress: string;
        streetNumber: string;
        apartmentNumber: string;
        coordinates: {
          latitude: number;
          longitude: number;
        };
      };
      siteDisplayName?: string;
      businessName?: string;
      logo?: string;
      description?: string;
      businessSchedule?: IWixBusinessSchedule;
      multilingual?: {
        supportedLanguages: IWixSupportedLanguage;
        autoRedirect: boolean;
      };
      consentPolicy?: {
        essential: boolean;
        functional: boolean;
        analytics: boolean;
        advertising: boolean;
        dataToThirdParty: boolean;
      };
      businessConfig?: 'FITNESS SERVICE' | 'RESTAURANT' | 'BLOG' | 'STORE' | 'EVENT' | 'UNKNOWN';
      externalSiteUrl?: string;
      trackClicksAnalytics?: boolean;
    };
  };
}

export interface IWebhookOrderUpdate {
  id: string;
  entityFqdn: string;
  slug: string;
  entityId: string;
  updatedEvent: {
    currentEntity: IWixEcomOrderDetail;
  };
  eventTime: string;
  triggeredByAnonymizeRequest: boolean;
}

export interface IWebhookPaymentStatusUpdate {
  id: string;
  slug: string;
  entityId: string;
  entityFqdn: string;
  eventTime: string;
  actionEvent: {
    body: {
      order: IWixEcomOrderDetail;
      previousPaymentStatus: WixOrderPaymentStatus;
    };
  };
  triggeredByAnonymizeRequest: boolean;
}

export interface IWebhookTransactionUpdate {
  id: string;
  entityFqdn: string;
  slug: string;
  entityId: string;
  actionEvent: {
    body: {
      orderTransactions: IOrderTransaction;
      paymentIds: string[];
      refundIds: string[];
    };
  };
  eventTime: string;
  triggeredByAnonymizeRequest: boolean;
}

export interface IWebhookFulfillmentUpdate {
  id: string;
  entityFqdn: string;
  slug: string;
  entityId: string;
  eventTime: string;
  triggeredByAnonymizeRequest: boolean;
  originatedFrom?: string;
  updatedEvent: {
    currentEntity: IOrderFulfillment;
  };
}

export interface IWebhookFulfilledStatusUpdate {
  entityId: string;
  slug: string;
  id: string;
  entityFqdn: string;
  eventTime: string;
  actionEvent: {
    body: {
      order: IWixEcomOrderDetail;
      previousFulfillmentStatus: WixFulfilledStatus;
      newFulfillmentStatus: WixFulfilledStatus;
      action: string;
    };
  };
  triggeredByAnonymizeRequest: boolean;
}

export interface IPayment {
  id: string;
  regularPaymentDetails: {
    gatewayTransactionId: string;
    paymentMethod: string;
    providerTransactionId: string;
    offlinePayment: boolean;
    status: TransactionPaymentStatus;
  };
  createdDate: string;
  updatedDate: string;
  amount: IOrderMoney;
  refundDisabled: boolean;
}

export interface IPaymentRefund {
  id: string;
  transactions: IPaymentRefundTransaction[];
  details: { items: []; shippingIncluded: boolean };
  createdDate: string;
}

export interface IPaymentRefundTransaction {
  paymentId: string;
  amount: IOrderMoney;
  refundStatus: string;
  gatewayRefundId: string;
  providerRefundId: string;
  externalRefund: boolean;
}

export interface IFulfillment {
  id: string;
  createdDate: string;
  lineItems: { id: string; quantity: number }[];
  status?: 'Pending' | 'Accepted' | 'Ready' | 'In_Delivery' | 'Fulfilled';
  trackingInfo: ITrackingInfo;
  customInfo?: { fieldsData?: Record<string, string> };
}

export interface ICustomField {
  value: string;
  title: string;
  translatedTitle: string;
}

export interface ITrackingInfo {
  trackingNumber: string;
  shippingProvider: string;
  trackingLink: string;
}

export interface IWixEcomOrderDetail {
  id: string;
  number: string;
  createdDate: string;
  updatedDate: string;
  lineItems: IOrderLineItem[];
  buyerInfo: {
    contactId: string;
    email: string;
    visitorId: string;
  };
  paymentStatus: WixOrderPaymentStatus;
  fulfillmentStatus: WixFulfilledStatus;
  buyerLanguage: string;
  weightUnit: WixWeightUnit;
  currency: string;
  taxIncludedInPrices: boolean;
  priceSummary: IPaySummary;
  billingInfo: IOrderAddressInfo;
  shippingInfo: IEcomOrderShippingInfo;
  status: 'INITIALIZED' | 'APPROVED' | 'CANCELED';
  archived: boolean;
  taxSummary: {
    totalTax: IOrderMoney;
  };
  appliedDiscounts: IEcomOrderAppliedDiscount[];
  activities: IOrderActivity[];
  attributionSource: 'UNSPECIFIED' | 'FACEBOOK_ADS';
  createdBy: {
    visitorId?: string;
    userId?: string;
    memberId?: string;
    appId?: string;
  };
  channelInfo: {
    type:
      | 'UNSPECIFIED'
      | 'WEB'
      | 'POS'
      | 'EBAY'
      | 'AMAZON'
      | 'OTHER_PLATFORM'
      | 'WIX_APP_STORE'
      | 'WIX_INVOICES'
      | 'BACKOFFICE_MERCHANT'
      | 'WISH'
      | 'CLASS_PASS'
      | 'GLOBAL_E';
    externalOrderId?: string;
    externalOrderUrl?: string;
  };
  seenByAHuman: boolean;
  checkoutId: string;
  customFields: ICustomField[];
  cartId: string;
  isInternalOrderCreate: boolean;
  payNow: IPaySummary;
  balanceSummary: {
    balance: IOrderMoney;
    paid: IOrderMoney;
    refunded: IOrderMoney;
  };
  additionalFees: IOrderAdditionalFee[];
  extendedFields?: { namespaces: Record<string, Record<string, any>> };
  purchaseFlowId?: string;
  recipientInfo: IOrderAddressInfo;
}

export interface IOrderMoney {
  amount: string;
  formattedAmount: string;
}

export interface IOrderAddress {
  country: string;
  subdivision: string;
  city: string;
  postalCode: string;
  addressLine: string;
  countryFullname: string;
  subdivisionFullname: string;
}

export interface IOrderContact {
  firstName: string;
  lastName: string;
  phone: string;
  company?: string;
}

export interface IOrderTitle {
  original: string;
  translated: string;
}

export interface IOrderActivity {
  id?: string;
  authorEmail?: string;
  createdDate: string;
  type: WixActivityType;
}

export interface IOrderAdditionalFee {
  code: string;
  name: string;
  price: IOrderMoney;
  taxDetails: IOrderTaxDetail;
  providerAppId: string;
  priceBeforeTax: IOrderMoney;
  id: string;
  lineItemIds: string[];
}

export interface IOrderTaxDetail {
  taxableAmount?: IOrderMoney;
  taxRate: string;
  totalTax: IOrderMoney;
}

export interface IOrderAddressInfo {
  address: IOrderAddress;
  contactDetails: IOrderContact;
}

export interface IPaySummary {
  subtotal: IOrderMoney;
  shipping: IOrderMoney;
  tax: IOrderMoney;
  discount: IOrderMoney;
  totalPrice: IOrderMoney;
  total: IOrderMoney;
  totalWithGiftCard: IOrderMoney;
  totalWithoutGiftCard: IOrderMoney;
  totalAdditionalFees?: IOrderMoney;
}

export interface IOrderLineItem {
  id: string;
  productName: IOrderTitle;
  catalogReference: {
    catalogItemId: string;
    appId: string;
    options: {
      currency: string;
      quantity: number;
      variantId: string;
    };
  };
  quantity: number;
  totalDiscount: IOrderMoney;
  descriptionLines: Record<string, IOrderTitle>[];
  image: {
    id: string;
    url: string;
    height: number;
    width: number;
  };
  physicalProperties: {
    weight: number;
    shippable: boolean;
  };
  itemType: {
    preset?: WixLineItemType;
    custom?: string;
  };
  refundQuantity: number;
  price: IOrderMoney;
  priceBeforeDiscounts: IOrderMoney;
  totalPriceBeforeTax: IOrderMoney;
  totalPriceAfterTax: IOrderMoney;
  paymentOption:
    | 'FULL_PAYMENT_ONLINE'
    | 'FULL_PAYMENT_OFFLINE'
    | 'MEMBERSHIP'
    | 'DEPOSIT_ONLINE'
    | 'MEMBERSHIP_OFFLINE';
  taxDetails: IOrderTaxDetail;
  locations: [];
  lineItemPrice: IOrderMoney;
}

export interface IEcomOrderShippingInfo {
  carrierId: string; // 'c8a08776-c095-4dec-8553-8f9698d86adc'
  code: string; // '6bf532e1-8402-a19c-9c5b-c4090d79e36f';
  title: string; // 'FREE SHIPPING';
  logistics: {
    deliveryTime: string; // '10-20 business days';
    shippingDestination: IOrderAddressInfo;
  };
  cost: {
    price: IOrderMoney;
    totalPriceBeforeTax: IOrderMoney;
    totalPriceAfterTax: IOrderMoney;
    taxDetails: IOrderTaxDetail;
    discount: IOrderMoney;
  };
  region: {
    name: string; // 'International';
  };
}

export interface IEcomOrderAppliedDiscount {
  discountType: 'GLOBAL' | 'SPECIFIC_ITEMS' | 'SHIPPING';
  lineItemIds: string[];
  discountRule?: {
    id: string;
    name: IOrderTitle;
    amount: IOrderMoney;
  };
  merchantDiscount?: {
    amount: IOrderMoney;
    discountReason?: 'UNSPECIFIED' | 'EXCHANGED_ITEMS';
    description?: string;
  };
  coupon?: {
    id: string;
    code: string;
    name: string;
    amount: IOrderMoney;
  };
  id: string;
}

export interface IOrderTransaction {
  orderId: string;
  payments: IPayment[];
  refunds: IPaymentRefund[];
}

export interface IOrderFulfillment {
  orderId: string;
  fulfillments: IFulfillment[];
}

export interface IWixShopData {
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

export interface WixAppInstance {
  instanceId: string;
  appName: string;
  appVersion: string;
  isFree: boolean;
  billing: {
    packageName: string;
    billingCycle: string;
    timeStamp: string;
    expirationDate: Date;
    autoRenewing: boolean;
    invoiceId: string;
  };
  permissions: any[];
  availablePlans: any[];
  originInstanceId: string;
  isOriginSiteTemplate: boolean;
  copiedFromTemplate: boolean;
  freeTrialAvailable: boolean;
}

export interface IShopCheckoutAppearancePayload {
  shop: string;
}

export type IWixCycle = 'MONTHLY' | 'YEARLY' | 'NO_CYCLE' | 'ONE_TIME';

export type IWebhookPlanUpdate = IPlanPurchase | IPlanChanged | IPlanCycleCancelled;

export interface IPlanPurchase {
  operationTimeStamp: string;
  vendorProductId: string;
  cycle: IWixCycle;
  expiresOn: string;
}

export interface IPlanChanged {
  operationTimeStamp: string;
  vendorProductId: string;
  cycle: IWixCycle;
  previousVendorProductId: string;
  previousCycle: IWixCycle;
}

export interface IPlanCycleCancelled {
  operationTimeStamp: string;
  vendorProductId: string;
  cycle: IWixCycle;
  cancelReason: string;
  userReason: string;
  subscriptionCancellationType: string;
}

// new wix
export interface IWixImage {
  url: string;
  width: number;
  height: number;
}

export interface IWixQueryResponse {
  metadata: Metadata;
  totalResults: number;
}

export interface IWixProductResponse extends IWixQueryResponse {
  products: IWixProduct[];
}

export interface IWixCollectionResponse extends IWixQueryResponse {
  collections: IWixCollection[];
}

export interface IWixProduct {
  id: string;
  name: string;
  slug: string;
  visible: boolean;
  productType: string;
  description: string;
  stock: Stock;
  price: IWixPrice;
  priceData: IWixPrice;
  convertedPriceData: IWixPrice;
  additionalInfoSections: AdditionalInfoSection[];
  ribbons: Ribbon[];
  ribbon: string;
  brand: string;
  media: IWixMedia;
  customTextFields: CustomTextField[];
  manageVariants: boolean;
  productOptions: ProductOption[];
  productPageUrl: ProductPageUrl;
  numericId: string;
  inventoryItemId: string;
  discount: Discount;
  collectionIds: any[];
  variants: IWixProductVariant[];
  lastUpdated: string;
  seoData?: SeoData;
  sku?: string;
  weight?: number;
  createdDate: string;
  updatedDate: string;
}

export interface IWixCollection {
  id: string;
  name: string;
  media: IWixMedia;
  numberOfProducts: number;
  description: string;
  slug: string;
  visible: boolean;
}

export interface Stock {
  trackInventory: boolean;
  quantity?: number;
  inStock: boolean;
}

export interface IWixPrice {
  currency: string;
  price: number;
  discountedPrice: number;
  formatted: IWixFormatted;
}

export interface IWixFormatted {
  price: string;
  discountedPrice: string;
}

export interface AdditionalInfoSection {
  title: string;
  description: string;
}

export interface Ribbon {
  text: string;
}

export interface IWixMedia {
  mainMedia?: IWixItem;
  items: IWixItem[];
}

export interface IWixItem {
  thumbnail: IWixImage;
  mediaType: string;
  title: string;
  image: IWixImage;
  id: string;
}

export interface CustomTextField {
  title: string;
  maxLength: number;
  mandatory: boolean;
}

export interface ProductOption {
  optionType: string;
  name: string;
  choices: Choice[];
}

export interface Choice {
  value: string;
  description: string;
  media: IWixMedia;
  inStock: boolean;
  visible: boolean;
}

export interface ProductPageUrl {
  base: string;
  path: string;
}

export interface Discount {
  type: string;
  value: number;
}

export interface IWixProductVariant {
  id: string;
  choices: Choices;
  variant: IWixVariant;
}

export interface Choices {
  Size?: string;
  Color?: string;
}

export interface IWixVariant {
  priceData: IWixPrice;
  convertedPriceData: IWixPrice;
  weight: number;
  sku: string;
  visible: boolean;
}

export interface SeoData {
  tags: Tag[];
}

export interface Tag {
  type: string;
  children: string;
  custom: boolean;
  disabled: boolean;
  props?: IWixProps;
}

export interface IWixProps {
  name: string;
  content: string;
}

export interface Metadata {
  items: number;
  offset: number;
}
