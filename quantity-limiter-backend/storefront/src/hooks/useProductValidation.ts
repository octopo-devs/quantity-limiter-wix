import { useMemo } from 'react';
import { calculateOrderLimits } from '~/core/order-limit-calculator';
import useAppContext from '~/context/AppContext/useAppContext';
import useShopifyContext from '~/context/ShopifyContext/useShopifyContext';
import { QuantityLimitResult, QuantityLimitRule, WixVariant } from '~/shared/types/quantity-limit.types';

export function useProductValidation() {
  const { rules: appRules, shopData } = useAppContext();
  const { currentProduct, productData } = useShopifyContext();

  const rules = useMemo(() => (appRules || []) as unknown as QuantityLimitRule[], [appRules]);

  const collectionsInProducts = useMemo<Map<string, string[]>>(() => {
    const map = new Map<string, string[]>();
    if (currentProduct?.id && productData?.collections?.length) {
      map.set(currentProduct.id, productData.collections);
    }
    return map;
  }, [currentProduct, productData]);

  const results = useMemo<Record<string, QuantityLimitResult>>(() => {
    if (!rules.length || !currentProduct?.id || !productData) return {};

    const selectedVariant = currentProduct.selectedVariantId
      ? productData.variants?.find((v) => v.id === currentProduct.selectedVariantId)
      : undefined;
    const variantPrice = selectedVariant?.price ?? productData.price ?? 0;
    const variantId = currentProduct.selectedVariantId || currentProduct.id;

    const pageVariants: WixVariant[] = [
      {
        id: variantId,
        productId: currentProduct.id,
        title: productData.name || '',
        price: variantPrice,
        quantity: currentProduct.quantity,
        weight: productData.weight || 0,
        sku: selectedVariant?.sku || productData.sku,
      },
    ];

    return calculateOrderLimits({
      variants: pageVariants,
      rules,
      collectionsInProducts,
      shopData,
    });
  }, [rules, currentProduct, productData, shopData, collectionsInProducts]);

  const hasViolation = useMemo(() => Object.values(results).some((r) => !!r.text), [results]);

  return { results, hasViolation };
}
