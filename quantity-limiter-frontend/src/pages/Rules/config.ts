import { NotificationTrigger, RuleType } from '@/types/enum';
import { Rule } from '@/types/interface';

export const RULE_TYPE_ICON_COLORS: Record<RuleType, string> = {
  [RuleType.ORDER]: '#4A90E2',
  [RuleType.CUSTOMER]: '#50B83C',
  [RuleType.COLLECTION]: '#9B59B6',
  [RuleType.PRODUCT]: '#F49342',
};

export const getRuleMultipleFlag = (rule: Rule): boolean => {
  if (rule.type !== RuleType.PRODUCT) return false;
  return rule.ruleProduct?.sellProductInMultiples ?? false;
};

const formatItemCount = (value: number): string => {
  return value ? `${value}` : '-';
};

const formatDate = (value: string): string => {
  if (!value) return '-';
  return value.slice(0, 10);
};

export interface RuleTableRow {
  id: string;
  name: string;
  isActive: boolean;
  type: RuleType;
  typeLabel: string;
  min: string;
  max: string;
  multiple: boolean;
  start: string;
  end: string;
}

export const convertRuleToTableRow = (rule: Rule): RuleTableRow => {
  return {
    id: rule.id,
    name: rule.name,
    isActive: rule.isActive,
    type: rule.type,
    typeLabel: rule.type,
    min: formatItemCount(rule.minQty),
    max: formatItemCount(rule.maxQty),
    multiple: getRuleMultipleFlag(rule),
    start: formatDate(rule.createdAt),
    end: formatDate(rule.updatedAt),
  };
};

export const notificationOptions = [
  { id: NotificationTrigger.LIMIT_REACHED, value: 'Limit reached' },
  { id: NotificationTrigger.ADD_TO_CART_BUTTON_CLICKED, value: 'Add to cart button clicked' },
  { id: NotificationTrigger.NO_NOTIFICATION, value: 'No notification' },
];
