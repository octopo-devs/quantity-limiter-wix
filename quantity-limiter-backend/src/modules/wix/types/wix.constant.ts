import { PricingPlan } from 'src/shared/api/types/wix-api/wix-api.enum';

export const WIX_WEBHOOK_TOPICS = {
  PAID_PLAN_CHANGED: 'PaidPlanChanged',
  PAID_PLAN_AUTO_RENEW_CANCELLED: 'PaidPlanAutoRenewalCancelled',
  PAID_PLAN_PURCHASED: 'PaidPlanPurchased',
  APP_REMOVED: 'AppRemoved',

  SITE_PROPERTY_UPDATED: 'SitePropertiesUpdated',

  // V1
  PRODUCT_CREATED_V1: 'com.wix.ecommerce.catalog.api.v1.ProductCreated',
  PRODUCT_CHANGE_V1: 'com.wix.ecommerce.catalog.api.v1.ProductChanged',
  PRODUCT_DELETED_V1: 'com.wix.ecommerce.catalog.api.v1.ProductDeleted',
  PRODUCT_VARIANT_CHANGE_V1: 'com.wix.ecommerce.catalog.api.v1.VariantsChanged',

  COLLECTION_CREATED_V1: 'com.wix.ecommerce.catalog.api.v1.CollectionCreated',
  COLLECTION_CHANGED_V1: 'com.wix.ecommerce.catalog.api.v1.CollectionChanged',
  COLLECTION_DELETED_V1: 'com.wix.ecommerce.catalog.api.v1.CollectionDeleted',

  // V3
  PRODUCT_CREATED_V3: 'wix.stores.catalog.v3.product_created',
  PRODUCT_UPDATED_V3: 'wix.stores.catalog.v3.product_updated',
  PRODUCT_DELETED_V3: 'wix.stores.catalog.v3.product_deleted',
  PRODUCT_VARIANT_ADDED_V3: 'wix.stores.catalog.v3.product_variant_added',
  PRODUCT_VARIANT_UPDATED_V3: 'wix.stores.catalog.v3.product_variant_updated',
  PRODUCT_VARIANT_REMOVE_V3: 'wix.stores.catalog.v3.product_variant_removed',

  BRAND_CREATED_V3: 'wix.stores.catalog.v3.brand_created',
  BRAND_UPDATED_V3: 'wix.stores.catalog.v3.brand_updated',
  BRAND_DELETED_V3: 'wix.stores.catalog.v3.brand_deleted',

  RIBBON_CREATED_V3: 'wix.stores.catalog.v3.ribbon_created',
  RIBBON_UPDATED_V3: 'wix.stores.catalog.v3.ribbon_updated',
  RIBBON_DELETED_V3: 'wix.stores.catalog.v3.ribbon_deleted',
};

export const PRICING_PLANS_MAPPING = {
  free: PricingPlan.Free,
  standard: PricingPlan.Standard,
  pro: PricingPlan.Pro,
  plus: PricingPlan.Plus,
};
