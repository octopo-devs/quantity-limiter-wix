import { ShopGeneral } from '@nest/nest-types/modules/shop/entities/shop-general.entity';
import { ILanguage } from '@nest/nest-types/modules/shop/entities/language.entity';
import { Branding, QuantityLimitRule } from '~/shared/types/quantity-limit.types';

export interface IShopifyAppMetafieldPayload {
  rootLink: string;
  data?: {
    settings: ShopGeneral;
    rules: QuantityLimitRule[];
    languages: ILanguage[];
    branding?: Branding;
  };
  manualData?: boolean;
  shop?: string;
  publicKey?: string;
}
