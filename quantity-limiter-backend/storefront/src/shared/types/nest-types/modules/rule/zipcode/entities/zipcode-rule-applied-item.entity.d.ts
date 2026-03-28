import { AppliedItemsType } from '../../types/rule.enum';
import { ZipcodeRule } from './zipcode-rule.entity';
import { RuleAppliedItemsMapping } from '../../types/rule.dto';
export declare class ZipcodeRuleAppliedItems {
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
    rule: ZipcodeRule;
    itemsMapping?: RuleAppliedItemsMapping;
}
