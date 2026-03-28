import { ShippingSettingGroupRule } from '../types/shipping-rule.enum';
export declare class ShippingSetting {
    id: number;
    shop: string;
    privacy_page_url: string;
    privacy_page_text: string;
    privacy_more: string;
    only_show_specific_targets: boolean;
    admin_group_rule_by: ShippingSettingGroupRule;
}
