import { createContext, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { callAppApi } from '~/apis/index';
import { WixVariant } from '~/shared/types/quantity-limit.types';
import { ICartContext, ICartItem } from './cart-context.interface';

const CartContext = createContext<ICartContext | undefined>(undefined);

const CART_ID_KEY = 'ol-cart-id';

// ---------------------------------------------------------------------------
// localStorage helpers for persisting cartId across page loads
// ---------------------------------------------------------------------------

function getSavedCartId(): string | null {
  try {
    return localStorage.getItem(CART_ID_KEY);
  } catch {
    return null;
  }
}

function saveCartId(cartId: string) {
  try {
    localStorage.setItem(CART_ID_KEY, cartId);
  } catch {
    /* localStorage unavailable */
  }
}

function clearCartId() {
  try {
    localStorage.removeItem(CART_ID_KEY);
  } catch {
    /* localStorage unavailable */
  }
}

// ---------------------------------------------------------------------------
// Parse Wix cart API response into ICartItem[]
// ---------------------------------------------------------------------------

function parseCartLineItems(cart: any): ICartItem[] {
  if (!cart?.lineItems?.length) return [];

  return cart.lineItems.map((item: any) => ({
    productId: item.catalogReference?.catalogItemId || '',
    variantId: item._id || '',
    quantity: item.quantity || 0,
    price: parseFloat(item.price?.amount || '0'),
    weight: item.physicalProperties?.weight,
    name: item.productName?.original || item.productName?.translated,
    sku: item.physicalProperties?.sku,
  }));
}

// ---------------------------------------------------------------------------
// CartContextProvider
// ---------------------------------------------------------------------------

const CartContextProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<ICartItem[]>([]);
  const [isCartLoading, setIsCartLoading] = useState(true);

  /**
   * Fetch cart from backend using Wix REST API: GET /ecom/v1/carts/{cartId}
   * Returns true if cart was found, false if cart no longer exists.
   */
  const fetchCartById = useCallback(async (cartId: string): Promise<boolean> => {
    const shop = window.estimatedShop;
    const publicKey = window.estimatedAppMetafields?.publicKey;
    if (!shop || !publicKey) return false;

    try {
      const cart = await callAppApi('GET', 'GET_CURRENT_CART_INFO', {
        params: { shop, key: publicKey, cartId },
      });

      if (cart?.lineItems?.length) {
        setCartItems(parseCartLineItems(cart));
        saveCartId(cartId);
        return true;
      }

      // Cart exists but has 0 items (emptied after logout/purchase) — clear stale data
      clearCartId();
      window.estimatedCartId = undefined;
      setCartItems([]);
      return false;
    } catch {
      clearCartId();
      window.estimatedCartId = undefined;
      setCartItems([]);
      return false;
    }
  }, []);

  // On mount: restore cart from saved cartId, or start with empty cart
  useEffect(() => {
    const cartId = getSavedCartId();
    if (cartId) {
      fetchCartById(cartId).finally(() => setIsCartLoading(false));
    } else {
      setIsCartLoading(false);
    }
  }, [fetchCartById]);

  /**
   * Re-fetch cart from API.
   * Called via window.estimatedCartRefresh after AddToCart/RemoveFromCart events.
   */
  const refreshCart = useCallback(() => {
    const cartId = window.estimatedCartId || getSavedCartId();
    if (!cartId) return;

    saveCartId(cartId);
    fetchCartById(cartId);
  }, [fetchCartById]);

  // Clear cart state (called on logout / session change)
  const clearCart = useCallback(() => {
    clearCartId();
    window.estimatedCartId = undefined;
    setCartItems([]);
  }, []);

  useEffect(() => {
    window.estimatedCartRefresh = refreshCart;
    window.estimatedCartClear = clearCart;
  }, [refreshCart, clearCart]);

  // Map cart items to WixVariant format for quantity limit calculations
  const cartVariants = useMemo<WixVariant[]>(() => {
    return cartItems.map((item) => ({
      id: item.variantId || item.productId,
      productId: item.productId,
      title: item.name,
      price: item.price,
      quantity: item.quantity,
      weight: item.weight,
      sku: item.sku,
    }));
  }, [cartItems]);

  return (
    <CartContext.Provider value={{ cartItems, cartVariants, isCartLoading, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
};

export { CartContextProvider };
export default CartContext;
