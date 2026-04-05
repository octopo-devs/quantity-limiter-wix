import { QlCurrentProduct, QlProductData } from '~/shared/types/global';

export interface IShopifyContext {
  locale: string;
  currentPage: string;
  currentProduct?: QlCurrentProduct;
  productData?: QlProductData;
}
