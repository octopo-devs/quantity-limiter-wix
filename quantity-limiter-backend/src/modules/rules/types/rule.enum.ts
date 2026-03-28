export enum RuleType {
  PRODUCT = 'PRODUCT',
  COLLECTION = 'COLLECTION',
  CUSTOMER = 'CUSTOMER',
  ORDER = 'ORDER',
}

export enum NotificationTrigger {
  LIMIT_REACHED = 'LIMIT_REACHED',
  ADD_TO_CART_BUTTON_CLICKED = 'ADD_TO_CART_BUTTON_CLICKED',
  NO_NOTIFICATION = 'NO_NOTIFICATION',
}

// Rule Product
export enum ProductSelectionType {
  ALL_PRODUCTS = 'ALL_PRODUCTS',
  GROUP_OF_PRODUCTS = 'GROUP_OF_PRODUCTS',
  SPECIFIC_PRODUCTS = 'SPECIFIC_PRODUCTS',
}

export enum RuleGroupProductConditionType {
  TAG = 'TAG',
  VENDOR = 'VENDOR',
  TITLE = 'TITLE',
}

export enum RuleGroupProductConditionOperator {
  EQUALS = 'EQUALS',
  NOT_EQUALS = 'NOT_EQUALS',
  CONTAINS = 'CONTAINS',
  NOT_CONTAINS = 'NOT_CONTAINS',
  STARTS_WITH = 'STARTS_WITH',
  ENDS_WITH = 'ENDS_WITH',
}

// Rule Customer
export enum RuleCustomerConditionType {
  ALL_CUSTOMERS = 'ALL_CUSTOMERS',
  CUSTOMER_TAGS = 'CUSTOMER_TAGS',
}

// Rule Order
export enum OrderConditionType {
  TOTAL_PRODUCTS = 'TOTAL_PRODUCTS',
  TOTAL_PRICE = 'TOTAL_PRICE',
  TOTAL_WEIGHT = 'TOTAL_WEIGHT',
}
