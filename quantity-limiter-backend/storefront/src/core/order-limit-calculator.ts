// src/core/order-limit-calculator.ts
import {
  QuantityLimitRule,
  QuantityLimitResult,
  WixVariant,
  RuleType,
  ProductSelectionType,
  RuleCustomerConditionType,
  OrderConditionType,
  NotificationTrigger,
  Conjunction,
  RuleGroupConditionType,
} from '~/shared/types/quantity-limit.types';
import { formatCurrency } from '~/shared/utils/currency';
import { convertWeight } from '~/shared/utils/weight';

export interface CalculateLimitParams {
  variants: WixVariant[];
  rules: QuantityLimitRule[];
  collectionsInProducts?: Map<string, string[]>;
  customerTags?: string[];
  shopData: {
    currency: string;
    weightUnit: string;
  };
  languageCode?: string;
  isCartPage?: boolean;
}

export function calculateOrderLimits(params: CalculateLimitParams): Record<string, QuantityLimitResult> {
  const {
    variants,
    rules,
    collectionsInProducts = new Map(),
    customerTags = [],
    shopData,
    languageCode = '',
    isCartPage = false,
  } = params;

  const activeRules = rules.filter((r) => r.isActive);
  const rulesOnVariants = mapRulesToVariants({ allRules: activeRules, variants, collectionsInProducts, customerTags });
  const results: Record<string, QuantityLimitResult> = {};

  for (const [variantId] of rulesOnVariants.entries()) {
    const result = calculateVariantLimit({
      variantId,
      variants,
      rulesOnVariants,
      shopData,
      languageCode,
      isCartPage,
    });
    if (result.text) {
      results[variantId] = result;
    }
  }

  return results;
}

function mapRulesToVariants(params: {
  allRules: QuantityLimitRule[];
  variants: WixVariant[];
  collectionsInProducts: Map<string, string[]>;
  customerTags: string[];
}): Map<string, QuantityLimitRule[]> {
  const { allRules, variants, collectionsInProducts, customerTags } = params;
  const rulesMap = new Map<string, QuantityLimitRule[]>();

  variants.forEach((v) => rulesMap.set(v.id, []));

  const productRules = allRules.filter((r) => r.type === RuleType.PRODUCT);
  const collectionRules = allRules.filter((r) => r.type === RuleType.COLLECTION);
  const customerRules = allRules.filter((r) => r.type === RuleType.CUSTOMER);
  const orderRules = allRules.filter((r) => r.type === RuleType.ORDER);

  // Product rules
  productRules.forEach((rule) => {
    variants.forEach((variant) => {
      if (shouldApplyProductRule(rule, variant)) {
        const existing = rulesMap.get(variant.id) || [];
        rulesMap.set(variant.id, [...existing, rule]);
      }
    });
  });

  // Collection rules
  collectionRules.forEach((rule) => {
    if (!rule.ruleCollection?.collectionIds?.length) return;
    variants.forEach((variant) => {
      const productCollections = collectionsInProducts.get(variant.productId) || [];
      const matches = rule.ruleCollection!.collectionIds.some((cid) => productCollections.includes(cid));
      if (matches) {
        const existing = rulesMap.get(variant.id) || [];
        rulesMap.set(variant.id, [...existing, rule]);
      }
    });
  });

  // Customer rules
  customerRules.forEach((rule) => {
    if (shouldApplyCustomerRule(rule, customerTags)) {
      variants.forEach((variant) => {
        const existing = rulesMap.get(variant.id) || [];
        rulesMap.set(variant.id, [...existing, rule]);
      });
    }
  });

  // Order rules - apply to all variants
  orderRules.forEach((rule) => {
    variants.forEach((variant) => {
      const existing = rulesMap.get(variant.id) || [];
      rulesMap.set(variant.id, [...existing, rule]);
    });
  });

  return rulesMap;
}

function shouldApplyProductRule(rule: QuantityLimitRule, variant: WixVariant): boolean {
  const rp = rule.ruleProduct;
  if (!rp) return false;

  switch (rp.conditionType) {
    case ProductSelectionType.ALL_PRODUCTS:
      return true;
    case ProductSelectionType.SPECIFIC_PRODUCTS:
      return rp.productIds?.includes(variant.productId) || false;
    case ProductSelectionType.GROUP_OF_PRODUCTS:
      return checkGroupConditions(rp, variant);
    default:
      return false;
  }
}

function checkGroupConditions(rp: NonNullable<QuantityLimitRule['ruleProduct']>, variant: WixVariant): boolean {
  if (!rp.groupProducts?.length) return false;

  const check = (condition: { type: string; operator: string; value: string }): boolean => {
    const value = condition.value?.trim();
    if (!value) return true;

    let fieldValue = '';
    switch (condition.type) {
      case RuleGroupConditionType.TAG:
        return (variant.tags || []).some((tag) => matchOperator(tag, condition.operator, value));
      case RuleGroupConditionType.VENDOR:
        fieldValue = (variant.vendor || '').trim();
        break;
      case RuleGroupConditionType.TITLE:
        fieldValue = (variant.title || variant.name || '').trim();
        break;
      default:
        return false;
    }
    return matchOperator(fieldValue, condition.operator, value);
  };

  if (rp.conjunction === Conjunction.AND) {
    return rp.groupProducts.every(check);
  }
  return rp.groupProducts.some(check);
}

function matchOperator(fieldValue: string, operator: string, searchValue: string): boolean {
  switch (operator) {
    case 'EQUALS':
      return fieldValue === searchValue;
    case 'NOT_EQUALS':
      return fieldValue !== searchValue;
    case 'CONTAINS':
      return fieldValue.includes(searchValue);
    case 'NOT_CONTAINS':
      return !fieldValue.includes(searchValue);
    case 'STARTS_WITH':
      return fieldValue.startsWith(searchValue);
    case 'ENDS_WITH':
      return fieldValue.endsWith(searchValue);
    default:
      return false;
  }
}

function shouldApplyCustomerRule(rule: QuantityLimitRule, customerTags: string[]): boolean {
  const rc = rule.ruleCustomer;
  if (!rc) return false;

  if (rc.conditionType === RuleCustomerConditionType.ALL_CUSTOMERS) return true;

  if (rc.conditionType === RuleCustomerConditionType.CUSTOMER_TAGS) {
    const hasMatch = rc.customerTags?.some((tag) => customerTags.includes(tag));
    if (!hasMatch) return false;
    if (rc.excludeCustomerTags?.length) {
      const hasExcluded = rc.excludeCustomerTags.some((tag) => customerTags.includes(tag));
      if (hasExcluded) return false;
    }
    return true;
  }

  return false;
}

function calculateVariantLimit(params: {
  variantId: string;
  variants: WixVariant[];
  rulesOnVariants: Map<string, QuantityLimitRule[]>;
  shopData: { currency: string; weightUnit: string };
  languageCode: string;
  isCartPage: boolean;
}): QuantityLimitResult {
  const { variantId, variants, rulesOnVariants, shopData, languageCode, isCartPage } = params;
  const rules = rulesOnVariants.get(variantId) || [];
  const emptyResult: QuantityLimitResult = { text: '', rule: {} as QuantityLimitRule, total: 0, remaining: null };

  if (!rules.length) return emptyResult;

  const variant = variants.find((v) => v.id === variantId);
  if (!variant) return emptyResult;

  for (const rule of rules) {
    const total = calculateTotal(rule, variant, variants, shopData);
    const shouldShow = shouldShowMessage(rule, total, isCartPage);
    if (shouldShow) {
      const text = formatMessage(rule, total, shopData, languageCode);
      if (text) return { text, rule, total, remaining: null };
    }
  }

  return emptyResult;
}

function calculateTotal(
  rule: QuantityLimitRule,
  variant: WixVariant,
  variants: WixVariant[],
  shopData: { currency: string; weightUnit: string },
): number {
  if (rule.type === RuleType.ORDER && rule.ruleOrder) {
    switch (rule.ruleOrder.conditionType) {
      case OrderConditionType.TOTAL_PRODUCTS:
        return variants.reduce((sum, v) => sum + (v.quantity || 0), 0);
      case OrderConditionType.TOTAL_PRICE:
        return variants.reduce((sum, v) => sum + (v.price || 0) * (v.quantity || 0), 0);
      case OrderConditionType.TOTAL_WEIGHT:
        return variants.reduce((sum, v) => {
          const w = v.weight || 0;
          return sum + convertWeight(w, shopData.weightUnit as 'kg' | 'lb' | 'oz' | 'g') * (v.quantity || 0);
        }, 0);
      default:
        return 0;
    }
  }

  // For PRODUCT, COLLECTION, CUSTOMER: quantity-based
  return variant.quantity || 0;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function shouldShowMessage(rule: QuantityLimitRule, total: number, _isCartPage: boolean): boolean {
  if (rule.notifyAboutLimitWhen === NotificationTrigger.NO_NOTIFICATION) return false;

  if (rule.minQty && total < rule.minQty) return true;
  if (rule.maxQty && total > rule.maxQty) return true;

  return false;
}

function formatMessage(
  rule: QuantityLimitRule,
  total: number,
  shopData: { currency: string; weightUnit: string },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _languageCode: string,
): string {

  // Check ORDER type with special condition types
  if (rule.type === RuleType.ORDER && rule.ruleOrder) {
    switch (rule.ruleOrder.conditionType) {
      case OrderConditionType.TOTAL_PRICE:
        if (rule.maxQty && total > rule.maxQty) {
          return (rule.maxQtyLimitMessage || '')
            .replace(/\{\{max\}\}/g, formatCurrency({ currency: shopData.currency, value: rule.maxQty }))
            .replace(
              /\{\{maximum_total_product_value\}\}/g,
              formatCurrency({ currency: shopData.currency, value: rule.maxQty }),
            );
        }
        if (rule.minQty && total < rule.minQty) {
          return (rule.minQtyLimitMessage || '')
            .replace(/\{\{min\}\}/g, formatCurrency({ currency: shopData.currency, value: rule.minQty }))
            .replace(
              /\{\{minimum_total_product_value\}\}/g,
              formatCurrency({ currency: shopData.currency, value: rule.minQty }),
            );
        }
        break;
      case OrderConditionType.TOTAL_WEIGHT:
        if (rule.maxQty && total > rule.maxQty) {
          return (rule.maxQtyLimitMessage || '')
            .replace(/\{\{max\}\}/g, String(rule.maxQty))
            .replace(/\{\{maximum_product_weight\}\}/g, String(rule.maxQty))
            .replace(/\{\{weight_unit\}\}/g, shopData.weightUnit);
        }
        if (rule.minQty && total < rule.minQty) {
          return (rule.minQtyLimitMessage || '')
            .replace(/\{\{min\}\}/g, String(rule.minQty))
            .replace(/\{\{minimum_product_weight\}\}/g, String(rule.minQty))
            .replace(/\{\{weight_unit\}\}/g, shopData.weightUnit);
        }
        break;
    }
  }

  // Default quantity-based messages
  if (rule.maxQty && total > rule.maxQty) {
    return (rule.maxQtyLimitMessage || '')
      .replace(/\{\{max\}\}/g, String(rule.maxQty))
      .replace(/\{\{max_quantity\}\}/g, String(rule.maxQty))
      .replace(/\{\{maximum_product_quantity\}\}/g, String(rule.maxQty));
  }
  if (rule.minQty && total < rule.minQty) {
    return (rule.minQtyLimitMessage || '')
      .replace(/\{\{min\}\}/g, String(rule.minQty))
      .replace(/\{\{min_quantity\}\}/g, String(rule.minQty))
      .replace(/\{\{minimum_product_quantity\}\}/g, String(rule.minQty));
  }

  // Multiple check
  if (rule.breakMultipleLimitMessage && rule.ruleProduct?.sellProductInMultiples) {
    // This would need a multiple value - for now return empty
  }

  return '';
}
