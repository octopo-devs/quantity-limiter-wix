import { createContext, useMemo, ReactNode } from 'react';
import { QuantityLimitRule, QuantityLimitResult, WixVariant } from '~/shared/types/quantity-limit.types';
import { calculateOrderLimits } from '~/core/order-limit-calculator';
import useAppContext from '../AppContext/useAppContext';
import useShopifyContext from '../ShopifyContext/useShopifyContext';
import useCartContext from '../CartContext/useCartContext';
import { IQuantityLimitContext } from './quantity-limit-context.interface';

const QuantityLimitContext = createContext<IQuantityLimitContext | undefined>(undefined);

const QuantityLimitContextProvider = ({ children }: { children: ReactNode }) => {
  const { rules: appRules, shopGeneral } = useAppContext();
  const { currentProduct, currentVariant, currentProductInfo, selectedVariantId, pageQuantity } = useShopifyContext();
  const { cartVariants } = useCartContext();

  const rules = useMemo(() => (appRules || []) as unknown as QuantityLimitRule[], [appRules]);

  const collectionsInProducts = useMemo<Map<string, string[]>>(() => {
    const map = new Map<string, string[]>();
    if (currentProduct?.id && currentProductInfo?.collections?.length) {
      map.set(currentProduct.id, currentProductInfo.collections);
    }
    return map;
  }, [currentProduct, currentProductInfo]);

  const results = useMemo<Record<string, QuantityLimitResult>>(() => {
    if (!rules.length || !currentProduct) return {};

    // Resolve variant-specific price when a variant is selected
    const selectedWixVariant = selectedVariantId
      ? currentProductInfo?.variants?.find((v) => v.id === selectedVariantId)
      : undefined;
    const variantPrice = selectedWixVariant?.price ?? currentProduct.price ?? 0;

    // Build a single variant entry for the current product.
    // Wix "options" are option choices (e.g. Small/Medium), NOT separate product variants.
    const variantId = currentVariant?.id || selectedVariantId || currentProduct.id || '';
    const pageVariants: WixVariant[] = [
      {
        id: variantId,
        productId: currentProduct.id || '',
        title: currentProduct.name || '',
        price: variantPrice,
        quantity: pageQuantity,
        weight: currentProduct.weight || 0,
        sku: currentVariant?.sku,
      },
    ];

    const mergedVariants = mergeWithCartData(pageVariants, cartVariants);

    return calculateOrderLimits({
      variants: mergedVariants,
      rules,
      collectionsInProducts,
      shopData: {
        currency: shopGeneral?.currency || 'USD',
        weightUnit: shopGeneral?.weightUnit || 'kg',
      },
    });
  }, [rules, currentProduct, currentVariant, selectedVariantId, currentProductInfo, shopGeneral, cartVariants, collectionsInProducts, pageQuantity]);

  const hasViolation = useMemo(() => Object.values(results).some((r) => !!r.text), [results]);

  return (
    <QuantityLimitContext.Provider value={{ rules, results, hasViolation }}>
      {children}
    </QuantityLimitContext.Provider>
  );
};

/**
 * Merge page product variants with cart data for accurate limit calculation.
 *
 * - For PRODUCT rules: current product quantity = page input + cart quantity
 * - For ORDER rules: all cart items are included for total calculation
 */
function mergeWithCartData(pageVariants: WixVariant[], cartVariants: WixVariant[]): WixVariant[] {
  const merged = pageVariants.map((pv) => {
    const cartItem = cartVariants.find((cv) => cv.productId === pv.productId || cv.id === pv.id);
    if (!cartItem) return pv;
    return { ...pv, quantity: (pv.quantity || 0) + (cartItem.quantity || 0) };
  });

  // Add other cart items (different products) for ORDER rule calculations
  for (const cv of cartVariants) {
    const alreadyIncluded = merged.some((pv) => pv.productId === cv.productId || pv.id === cv.id);
    if (!alreadyIncluded) {
      merged.push(cv);
    }
  }

  return merged;
}

export { QuantityLimitContextProvider };
export default QuantityLimitContext;
