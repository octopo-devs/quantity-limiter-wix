// src/shared/types/quantity-limit.types.ts

export enum RuleType {
  PRODUCT = 'PRODUCT',
  COLLECTION = 'COLLECTION',
  CUSTOMER = 'CUSTOMER',
  ORDER = 'ORDER',
}

export enum ProductSelectionType {
  ALL_PRODUCTS = 'ALL_PRODUCTS',
  GROUP_OF_PRODUCTS = 'GROUP_OF_PRODUCTS',
  SPECIFIC_PRODUCTS = 'SPECIFIC_PRODUCTS',
}

export enum RuleGroupConditionType {
  TAG = 'TAG',
  VENDOR = 'VENDOR',
  TITLE = 'TITLE',
}

export enum RuleGroupConditionOperator {
  EQUALS = 'EQUALS',
  NOT_EQUALS = 'NOT_EQUALS',
  CONTAINS = 'CONTAINS',
  NOT_CONTAINS = 'NOT_CONTAINS',
  STARTS_WITH = 'STARTS_WITH',
  ENDS_WITH = 'ENDS_WITH',
}

export enum Conjunction {
  AND = 'AND',
  OR = 'OR',
}

export enum RuleCustomerConditionType {
  ALL_CUSTOMERS = 'ALL_CUSTOMERS',
  CUSTOMER_TAGS = 'CUSTOMER_TAGS',
}

export enum OrderConditionType {
  TOTAL_PRODUCTS = 'TOTAL_PRODUCTS',
  TOTAL_PRICE = 'TOTAL_PRICE',
  TOTAL_WEIGHT = 'TOTAL_WEIGHT',
}

export enum NotificationTrigger {
  LIMIT_REACHED = 'LIMIT_REACHED',
  ADD_TO_CART_BUTTON_CLICKED = 'ADD_TO_CART_BUTTON_CLICKED',
  NO_NOTIFICATION = 'NO_NOTIFICATION',
}

export enum DisplayType {
  INLINE = 'INLINE',
}

export enum TextAlign {
  LEFT = 'LEFT',
}

export interface RuleGroupProductCondition {
  type: RuleGroupConditionType;
  operator: RuleGroupConditionOperator;
  value: string;
}

export interface RuleProductSelection {
  productId: string;
  variantId?: string;
}

export interface RuleProduct {
  ruleId: string;
  conditionType: ProductSelectionType;
  productIds: RuleProductSelection[];
  groupProducts: RuleGroupProductCondition[];
  conjunction: Conjunction;
  sellProductInMultiples: boolean;
}

export interface RuleCollection {
  ruleId: string;
  collectionIds: string[];
}

export interface RuleCustomer {
  ruleId: string;
  conditionType: RuleCustomerConditionType;
  customerTags: string[];
  excludeCustomerTags: string[];
}

export interface RuleOrder {
  ruleId: string;
  conditionType: OrderConditionType;
}

export interface QuantityLimitRule {
  id: string;
  shop: string;
  name: string;
  type: RuleType;
  isActive: boolean;
  minQty: number;
  maxQty: number;
  notifyAboutLimitWhen: NotificationTrigger;
  showContactUsInNotification: boolean;
  minQtyLimitMessage: string;
  maxQtyLimitMessage: string;
  breakMultipleLimitMessage: string | null;
  contactUsButtonText: string;
  contactUsMessage: string;
  ruleProduct: RuleProduct | null;
  ruleCollection: RuleCollection | null;
  ruleCustomer: RuleCustomer | null;
  ruleOrder: RuleOrder | null;
  createdAt: string;
  updatedAt: string;
}

export interface Branding {
  shop: string;
  displayType: DisplayType;
  backgroundColor: string;
  textColor: string;
  fontFamily: string | null;
  textAlign: TextAlign;
  fontSize: number;
  customCss: string | null;
}

export interface QuantityLimitResult {
  text: string;
  rule: QuantityLimitRule;
  total: number;
  remaining: number | null;
}

export interface WixVariant {
  id: string;
  productId: string;
  title?: string;
  name?: string;
  price: number;
  quantity: number;
  weight?: number;
  vendor?: string;
  tags?: string[];
  sku?: string;
}
