import { ZipcodeRuleSpecificType } from '../types/zipcode-rule.enum';
import { CartPageDateDisplayType } from 'src/modules/shop/types/shop.enum';
import { ZipcodeRuleTarget } from './zipcode-rule-target.entity';
import { ZipcodeRule } from './zipcode-rule.entity';
export declare class ZipcodeRuleSpecific {
    id: number;
    shop: string;
    type: ZipcodeRuleSpecificType;
    specific_id: string;
    specific_title: string;
    zipcode_id: number;
    zipcode_name: string;
    enable: boolean;
    minimum_days: number;
    ql_days: number;
    order_to_ship_days: number;
    ship_to_receive_days: number;
    custom_text: string;
    show_text_in_cart: boolean;
    override_text_in_cart: boolean;
    cart_page_label_text: string;
    cart_page_date_display: string;
    cart_page_date_display_type: CartPageDateDisplayType;
    soldOutEnabled: boolean;
    soldOutCustomText: string;
    soldOutCustomTextEnabled: boolean;
    ruleTargets?: ZipcodeRuleTarget[];
    zipcodeRules: ZipcodeRule[];
}
