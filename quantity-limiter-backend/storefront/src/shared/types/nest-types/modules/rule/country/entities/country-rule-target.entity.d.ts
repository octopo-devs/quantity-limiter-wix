import { CountryRuleSpecificType } from '../types/country-rule.enum';
import { CountryRuleSpecific } from './country-rule-specific.entity';
export declare class CountryRuleTarget {
    id: number;
    shop: string;
    specific_rule_id: number;
    type: CountryRuleSpecificType;
    specific_id: string;
    specific_title: string;
    countrySpecificRule: CountryRuleSpecific;
}
