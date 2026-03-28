import { AppliedItemsType } from '../../types/rule.enum';
import { ShippingMethod } from './shipping-method.entity';
import { RuleAppliedItemsMapping } from '../../types/rule.dto';
export declare class ShippingRuleAppliedItems {
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
    rule: ShippingMethod;
    itemsMapping?: RuleAppliedItemsMapping;
}
