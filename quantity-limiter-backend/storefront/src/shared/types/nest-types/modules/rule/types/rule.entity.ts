import { CartPageDateDisplayType } from '../../shop/types/shop.enum';
import { ItemConditionEnum, LocationConditionEnum, SubConditionTypeEnum, TypeRelationEnum } from './rule.enum';

export interface ISubCondition {
  groupConditionId: number;
  type: SubConditionTypeEnum;
  value: string;
}
export interface IGroupCondition {
  itemConditionId: number;
  typeRelationOfSubCondition: TypeRelationEnum;
  subConditions: ISubCondition[];
}
export interface IItemCondition {
  type: ItemConditionEnum;
  value: {
    data: string | string[]; // nếu type là product metafield thì data là string[]. Còn lại là string
    variants?: string;
    minInventoryQuantity?: string;
    maxInventoryQuantity?: string;
    key?: string;
    label?: string;
  }[];
  groupCondition?: IGroupCondition;
}
export interface ILocationCondition {
  type: LocationConditionEnum;
  value: {
    data: string;
    countryStateName?: string;
  }[];
}
export interface IRule {
  id: number;
  shop: string;
  itemConditions?: IItemCondition[];
  locationConditions?: ILocationCondition[];
  maxDeliveryDays: number;
  minDeliveryDays: number;
  maxPrepDays: number;
  minPrepDays: number;
  enable?: boolean;
  estimatedText?: string;
  showTextInCart?: boolean;
  cartPageLabelText?: string;
  cartPageDateDisplay?: string;
  cartPageDateDisplayType?: CartPageDateDisplayType;
  name: string;
  styledName?: string;
  showWhenProductIsOutOfStock?: boolean;
  soldOutEnabled?: boolean;
  soldOutCustomTextEnabled?: boolean;
  isShowDeliveryMethodName?: boolean;
  privacyPageUrl?: string;
  privacyPageText?: string;
  privacyMore?: string;
  typeRelationOfItemCondition?: TypeRelationEnum;
  soldOutCustomText?: string;
  languageRuleContentIds?: string;
  preOrderDate?: string;
  isUsePreOrderDate?: boolean;
  isCountInventoryQuantityFromLocations?: boolean;
}

export interface IProductMetafield {
  key: string;
  value: string[];
  label: string;
}
