import { RuleGroupProductConditionOperator, RuleGroupProductConditionType } from './rule.enum';

export interface RuleGroupProductCondition {
  type: RuleGroupProductConditionType;
  operator: RuleGroupProductConditionOperator;
  value: string | string[];
}
