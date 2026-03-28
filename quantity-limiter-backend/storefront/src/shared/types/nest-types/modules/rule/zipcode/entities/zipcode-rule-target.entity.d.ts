import { ZipcodeRuleSpecificType } from '../types/zipcode-rule.enum';
import { ZipcodeRuleSpecific } from './zipcode-rule-specific.entity';
export declare class ZipcodeRuleTarget {
    id: number;
    shop: string;
    specific_rule_id: number;
    type: ZipcodeRuleSpecificType;
    specific_id: string;
    specific_title: string;
    zipcodeSpecificRule: ZipcodeRuleSpecific;
}
