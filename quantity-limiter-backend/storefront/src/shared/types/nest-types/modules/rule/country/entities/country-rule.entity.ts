import { CartPageDateDisplayType } from '@nest/nest-types/modules/shop/types/shop.enum';
import { AppliedItemsType } from '../../types/rule.enum';
import { CountryRuleAppliedItems } from './country-rule-applied-items.entity';
export class CountryRule {
  id: number;
  shop: string;
  code: string;
  name: string;
  provinces: string;
  minimum_days: number;
  enable: boolean;
  soldOutEnabled: boolean;
  soldOutCustomText: string;
  soldOutCustomTextEnabled: boolean;
  estimated_days: number;
  order_to_ship_days: number;
  ship_to_receive_days: number;
  estimated_text: string;
  show_text_in_cart: boolean;
  override_text_in_cart: boolean;
  cart_page_label_text: string;
  cart_page_date_display: string;
  cart_page_date_display_type: CartPageDateDisplayType;
  delivery_label: string;
  display_courier_info: boolean;
  courier_name: string;
  courier_url: string;
  courier_label: string;
  show_sub_regions: boolean;
  ordering: number;
  appliedItemsType: AppliedItemsType;
  appliedItems: CountryRuleAppliedItems[];
  countryCode?: string;
}

export interface IProvince {
  code: string;
  name: string;
  enable_shipping: boolean;
  order_to_ship_days: number;
  ship_to_receive_days: number;
  minimum_days: number;
  estimated_days: number;
  use_custom_day: boolean;
}
