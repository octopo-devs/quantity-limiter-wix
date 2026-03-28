import { RuleType } from '@/types/enum';
import { Collections, Order, Tag, User } from '@wix/wix-ui-icons-common';

export enum CreateRuleStep {
  STEP_1 = 'STEP_1',
  STEP_2 = 'STEP_2',
}

export const STEP_CONFIG = {
  [CreateRuleStep.STEP_1]: {
    title: 'Select target',
    description: 'Choose the type of rule you want to create',
  },
  [CreateRuleStep.STEP_2]: {
    title: 'Setup detail',
    description: 'Configure the rule details',
  },
};

export const RULE_TYPE_ICONS = {
  [RuleType.ORDER]: Order,
  [RuleType.CUSTOMER]: User,
  [RuleType.COLLECTION]: Collections,
  [RuleType.PRODUCT]: Tag,
};

export const getStepNumber = (step: CreateRuleStep): number => {
  return Number(step.split('_')[1]);
};
