import { PlanSubscription, PricingPlan } from '../../app-pricing/types/app-pricing.enum';
import {
  CountdownTimerOption,
  DateDisplayMode,
  ShopLayout,
  DateRangeDirection,
  TimeCountDownFormat,
  DetectionMethod,
  DateCalculationMethod,
} from '../types/shop.enum';
export declare class TimelineIcon {
  iconId: number;
  iconUrl: string;
  isCustom: boolean;
}
export declare class ShopGeneral {
  id: number;
  shop: string;
  lastAccess: number;
  oldPlan: PricingPlan;
  plan: PricingPlan;
  subscription: PlanSubscription;
  planUpdatedAt: number;
  displayOnboarding: boolean;
  script_tag_id: string;
  layout: ShopLayout;
  isUseSeparateWorkingDays: boolean;
  week_working_days: string;
  specific_day_off: string;
  position_code: number;
  custom_css: string;
  show_on_line_item: number;
  show_on_pages: string;
  custom_position: string;
  render_method: string;
  enable_app: number;
  disable_when_product_is_out_of_stock: number;
  date_timezone_offset: string;
  type_time_countdown: TimeCountDownFormat;
  textCountDownFormat: string;
  countdown_timer_option: CountdownTimerOption;
  countdown_timer_show_after_cutoff: boolean;
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
  require_add_to_cart: number;
  clientJsUrl: string;
  choose_layout: string;
  labelCheckout: string;
  get_customer_zipcode: number;
  created_at: Date;
  updated_at: Date;
  text_size: number;
  text_color: string;
  icon_color: string;
  border_color: string;
  background_color: string;
  show_shipping_method: boolean;
  enable_eta_information: boolean;
  enable_timeline_layout: number;
  timeline_order_step_enable: boolean;
  timeline_order_step_title: string;
  timeline_order_step_description: string;
  timeline_ship_step_enable: boolean;
  timeline_ship_step_title: string;
  timeline_ship_step_description: string;
  timeline_delivery_step_enable: boolean;
  timeline_delivery_step_title: string;
  timeline_delivery_step_description: string;
  timeline_date_range_direction: DateRangeDirection;
  timeline_date_range_icon: string;
  date_format: string;
  date_locale: string;
  date_display_mode: DateDisplayMode;
  detectionMethod: DetectionMethod;
  cart_page_label_text: string;
  cart_page_date_display: string;
  timelineShipIcon: TimelineIcon;
  timelineOrderIcon: TimelineIcon;
  timelineDeliveryIcon: TimelineIcon;
  isShowDeliveryMethodName: boolean;
  cannyId?: string;
  themeName: string;
  themeStoreId: number;
  isDynamicDateInCart: boolean;
  customDynamicDateInCart: string;
  ruleSortBy?: SortOptionsEnum;
  shippingMethodLabel: string;
  isHiddenCountryRulesNotDetected?: boolean;
  isShowWhenInventoryNotTracked?: boolean;
  dateCalculationMethod: DateCalculationMethod;
}

export enum SortOptionsEnum {
  IdDesc = 'id_desc',
  IdAsc = 'id_asc',
  NameDesc = 'name_desc',
  NameAsc = 'name_asc',
  MinPrepareDesc = 'min_prepare_desc',
  MinPrepareAsc = 'min_prepare_asc',
  MaxPrepareDesc = 'max_prepare_desc',
  MaxPrepareAsc = 'max_prepare_asc',
  MinDeliveryDesc = 'min_delivery_desc',
  MinDeliveryAsc = 'min_delivery_asc',
  MaxDeliveryDesc = 'max_delivery_desc',
  MaxDeliveryAsc = 'max_delivery_asc',
}
