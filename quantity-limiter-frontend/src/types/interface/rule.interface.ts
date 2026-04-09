import {
  Conjunction,
  NotificationTrigger,
  OrderConditionType,
  ProductSelectionType,
  RuleCustomerConditionType,
  RuleGroupProductConditionOperator,
  RuleGroupProductConditionType,
  RuleType,
} from '@/types/enum';

export interface RuleGroupProductCondition {
  type: RuleGroupProductConditionType;
  operator: RuleGroupProductConditionOperator;
  value: string | string[];
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

export interface Rule {
  id: string;
  shop: string;
  name: string;
  type: RuleType;
  ruleProduct?: RuleProduct;
  ruleCollection?: RuleCollection;
  ruleCustomer?: RuleCustomer;
  ruleOrder?: RuleOrder;
  isActive: boolean;
  minQty: number;
  maxQty: number;
  notifyAboutLimitWhen: NotificationTrigger;
  showContactUsInNotification: boolean;
  minQtyLimitMessage: string;
  maxQtyLimitMessage: string;
  breakMultipleLimitMessage?: string;
  contactUsButtonText: string;
  contactUsMessage: string;
  createdAt: string;
  updatedAt: string;
}
