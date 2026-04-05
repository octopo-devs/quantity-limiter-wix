import { ShippingRuleTarget } from './shipping-rule-target.entity';
import { ShippingMethod } from './shipping-method.entity';
import { CartPageDateDisplayType } from 'src/modules/shop/types/shop.enum';
export declare class ShippingRule {
    id: number;
    shop: string;
    shipping_method_id: number;
    enable: boolean;
    minimum_days: number;
    ql_days: number;
    order_to_ship_days: number;
    ship_to_receive_days: number;
    ql_text: string;
    show_text_in_cart: boolean;
    override_text_in_cart: boolean;
    cart_page_label_text: string;
    cart_page_date_display: string;
    cart_page_date_display_type: CartPageDateDisplayType;
    custom_text: string;
    soldOutEnabled: boolean;
    soldOutCustomText: string;
    soldOutCustomTextEnabled: boolean;
    method?: ShippingMethod;
    ruleTargets?: ShippingRuleTarget[];
}
