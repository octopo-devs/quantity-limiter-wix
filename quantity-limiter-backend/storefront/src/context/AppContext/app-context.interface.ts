import { ReactNode } from 'react';
import { ILanguage } from '../../shared/types/nest-types/modules/shop/entities/language.entity';
import { ShopGeneral } from '../../shared/types/nest-types/modules/shop/entities/shop-general.entity';
import { Branding, QuantityLimitRule } from '~/shared/types/quantity-limit.types';

export interface IAppContextProviderProps {
  children: ReactNode;
  metafields: any;
}

export interface IAppContext {
  rootLink: string;
  shopGeneral?: ShopGeneral;
  rules: QuantityLimitRule[];
  branding?: Branding;
  isAppEnabled: boolean;
  positionClass: string;
  isAllApiCalled: boolean;
  languages: ILanguage[];
  handleChangeSettingsLanguage: (language: ILanguage) => void;
  locationInfo?: { language_code?: string };
}
