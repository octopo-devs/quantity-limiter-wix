import { IWixCurrentVariant, IWixProductData, IWixVariant } from '@nest/wix.interface';

export interface IShopifyContext {
  locale: string;
  currentPage: string;
  currentProduct?: IWixProductData;
  currentVariant?: IWixCurrentVariant;
  currentProductInfo: {
    variants?: IWixVariant[];
    collections?: string[];
  };
}
