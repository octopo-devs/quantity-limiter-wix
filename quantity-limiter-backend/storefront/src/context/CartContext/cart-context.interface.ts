import { WixVariant } from '~/shared/types/quantity-limit.types';

export interface ICartItem {
  productId: string;
  variantId: string;
  quantity: number;
  price: number;
  weight?: number;
  name?: string;
  sku?: string;
}

export interface ICartContext {
  cartItems: ICartItem[];
  cartVariants: WixVariant[];
  isCartLoading: boolean;
  refreshCart: () => void;
}
