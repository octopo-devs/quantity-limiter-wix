import { ShippingRuleTargetType } from '../types/shipping-rule.enum';
import { ShippingRule } from './shipping-rule.entity';
export declare class ShippingRuleTarget {
    id: number;
    shop: string;
    rule_id: number;
    shipping_method_id: number;
    type: ShippingRuleTargetType;
    value: string;
    shippingRule: ShippingRule;
    title?: string;
}
