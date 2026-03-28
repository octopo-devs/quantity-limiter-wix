export enum CurrentOnboardingStep {
  ONE = 1,
  TWO,
  THREE,
  FOUR,
  FIVE,
  SIX,
}

export enum TouchPoints {
  PRICING_PLAN = 'pricing_plan',
  HOME_TOP_BANNER = 'home_top_banner',
  checklist_estimate_rule_limit = 'checklist_estimate_rule_limit',
  CHECKLIST_SHOW_IN_CART = 'checklist_show_in_cart',
  CHECKLIST_AUTO_DETECT_LOCATION = 'checklist_auto_detect_location',
  SETTINGS_TOP_BANNER = 'settings_top_banner',
  SETUP_SHOW_IN_CART = 'setup_show_in_cart',
  APPEARANCE_CHANGE_ICON = 'appearance_change_icon',
  APPEARANCE_VISUAL_EDITOR = 'appearance_visual_editor',
  CUSTOM_CSS = 'custom_css',
  SETUP_OUT_OF_STOCK = 'setup_out_of_stock',
  UPGRADE_ETA_CHECKOUT = 'upgrade_ETA_checkout',
}

export enum LogRule {
  VisitorsProductPage = 'visitorsProductPage',
  BannerImpressions = 'bannerImpressions',
  HoverBannerETA = 'hoverBannerETA',
  BannerClicks = 'bannerClicks',
  AddToCart = 'addToCart',
}
