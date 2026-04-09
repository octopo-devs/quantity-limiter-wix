import { RuleGroupProductConditionOperator, RuleGroupProductConditionType } from './rule.enum';

export interface RuleProductSelection {
  productId: string;
  variantId?: string;
}

export interface RuleGroupProductCondition {
  type: RuleGroupProductConditionType;
  operator: RuleGroupProductConditionOperator;
  value: string | string[];
}
