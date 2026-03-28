import { CartPageDateDisplayType } from 'src/modules/shop/types/shop.enum';
import { CountryRuleTarget } from './country-rule-target.entity';
export declare class CountryRuleSpecific {
    id: number;
    shop: string;
    country_codes: string;
    enable: boolean;
    minimum_days: number;
    estimated_days: number;
    order_to_ship_days: number;
    ship_to_receive_days: number;
    show_text_in_cart: boolean;
    override_text_in_cart: boolean;
    cart_page_label_text: string;
    cart_page_date_display: string;
    cart_page_date_display_type: CartPageDateDisplayType;
    custom_text: string;
    soldOutEnabled: boolean;
    soldOutCustomTextEnabled: boolean;
    soldOutCustomText: string;
    ruleTargets?: CountryRuleTarget[];
}
