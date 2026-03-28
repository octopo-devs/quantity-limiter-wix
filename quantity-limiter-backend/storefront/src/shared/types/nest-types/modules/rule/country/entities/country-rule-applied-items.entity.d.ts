import { AppliedItemsType } from '../../types/rule.enum';
import { CountryRule } from './country-rule.entity';
import { RuleAppliedItemsMapping } from '../../types/rule.dto';
export declare class CountryRuleAppliedItems {
    id: number;
    shop: string;
    type: AppliedItemsType;
    ruleId: number;
    products: string;
    collections: string;
    vendors: string;
    isUseExceptionProductCollection: boolean;
    isUseExceptionProductVendor: boolean;
    exceptionProductsCollection: string;
    exceptionProductsVendor: string;
    rule: CountryRule;
    itemsMapping?: RuleAppliedItemsMapping;
}
