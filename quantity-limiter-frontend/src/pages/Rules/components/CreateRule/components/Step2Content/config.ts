import {
  Conjunction,
  OrderConditionType,
  ProductSelectionType,
  RuleCustomerConditionType,
  RuleGroupProductConditionOperator,
  RuleGroupProductConditionType,
} from '@/types/enum';

export const productSelectionOptions = [
  { id: ProductSelectionType.ALL_PRODUCTS, value: 'All Products' },
  { id: ProductSelectionType.GROUP_OF_PRODUCTS, value: 'Group of Products' },
  { id: ProductSelectionType.SPECIFIC_PRODUCTS, value: 'Specific Products' },
];

export const customerConditionOptions = [
  { id: RuleCustomerConditionType.ALL_CUSTOMERS, value: 'All Customers' },
  { id: RuleCustomerConditionType.CUSTOMER_TAGS, value: 'Customer Tags' },
];

export const orderConditionOptions = [
  { id: OrderConditionType.TOTAL_PRODUCTS, value: 'Total Products' },
  { id: OrderConditionType.TOTAL_PRICE, value: 'Total Price' },
];

export const conjunctionOptions = [
  { id: Conjunction.AND, value: 'AND' },
  { id: Conjunction.OR, value: 'OR' },
];

export const groupProductTypeOptions = [
  { id: RuleGroupProductConditionType.TAG, value: 'Tag' },
  { id: RuleGroupProductConditionType.TITLE, value: 'Name' },
];

export const groupProductOperatorOptions = [
  { id: RuleGroupProductConditionOperator.EQUALS, value: 'Equals' },
  { id: RuleGroupProductConditionOperator.NOT_EQUALS, value: 'Not Equals' },
  { id: RuleGroupProductConditionOperator.CONTAINS, value: 'Contains' },
  { id: RuleGroupProductConditionOperator.NOT_CONTAINS, value: 'Not Contains' },
  { id: RuleGroupProductConditionOperator.STARTS_WITH, value: 'Starts With' },
  { id: RuleGroupProductConditionOperator.ENDS_WITH, value: 'Ends With' },
];
