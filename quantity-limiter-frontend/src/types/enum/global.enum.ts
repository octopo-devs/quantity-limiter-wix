export enum BREAKPOINT {
  XS = 490,
  SM = 768,
  MD = 1040,
  LG = 1800,
  XL = 1920,
}

export enum Subscription {
  Monthly = 'monthly',
  Annually = 'yearly',
}

export enum Plan {
  FREE = 'basic',
  STANDARD = 'standard',
  PRO = 'pro',
  SHOPIFY_PLUS = 'plus',
}

export enum ShopifyPlan {
  PLUS = 'shopify_plus',
  PARTNER_TEST = 'partner_test',
  PARTNER_SANDBOX = 'plus_partner_sandbox',
}

export enum EnableApp {
  Active = 1,
  InActive = 0,
}

export enum SortDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}

export enum Ga4Event {
  PricingPlanImpression = 'pricing_plan_impression',
  ChoosePlan = 'choose_plan',
  ChargeDone = 'charge_done',
  Uninstall = 'uninstall',
  SynctrackImpression = 'impress_ST',
  SynctrackClick = 'click_ST',
  BlockifyImpression = 'impress_checkout',
  BlockifyClick = 'click_checkout',
  OrderTrackingImpression = 'impress_homebanner3',
  OrderTrackingClick = 'click_homebanner3',
  ReturnsImpression = 'impress_returns',
  ReturnsClick = 'click_returns',
  ParetoImpression = 'impress_limit',
  ParetoClick = 'click_limit',
}

export enum Conjunction {
  AND = 'AND',
  OR = 'OR',
}
