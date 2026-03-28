export enum WixPage {
  Home = 'home',
  Cart = 'cart',
  Product = 'product_page',
  Collection = 'collection',
  ProductSiteCart = 'ecom_side_cart',
}

export enum RenderMethod {
  After = 'after',
  Before = 'before',
  Prepend = 'prepend',
  Append = 'append',
}

export enum WixStockingStatus {
  InStock = 'in stock',
  OutOfStock = 'out of stock',
}

// Legacy shipping-era stub — used in functions.ts dead code paths
export enum HiddenInputAttribute {
  RuleId = 'data-rule-id',
  MinPrepDays = 'data-min-prep-days',
  MaxPrepDays = 'data-max-prep-days',
  MinDeliveryDays = 'data-min-delivery-days',
  MaxDeliveryDays = 'data-max-delivery-days',
  EstText = 'data-est-text',
  CartLabelText = 'data-cart-label-text',
  ShowTextInCart = 'data-show-text-in-cart',
  PreOrderDate = 'data-pre-order-date',
}
