import { createContext, ReactNode, useEffect, useMemo, useState } from 'react';
import { IShopifyContext } from './shopify-context.interface';

const ShopifyContext = createContext<undefined | IShopifyContext>(undefined);

const POLL_INTERVAL = 500;

const ShopifyContextProvider = ({ children }: { children: ReactNode }) => {
  const [currentProductState, setCurrentProductState] = useState(window.estimatedCurrentProduct);
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(
    window.estimatedCurrentProduct?.variantId,
  );
  const [pageQuantity, setPageQuantity] = useState<number>(window.estimatedQuantityOnPage ?? 1);

  // Poll window globals for changes (set by analytics event handlers in main.tsx)
  useEffect(() => {
    const interval = setInterval(() => {
      const current = window.estimatedCurrentProduct;

      if (JSON.stringify(current) !== JSON.stringify(currentProductState)) {
        setCurrentProductState(current);
        if (current?.variantId !== selectedVariantId) {
          setSelectedVariantId(current?.variantId);
        }
      }

      const qty = window.estimatedQuantityOnPage ?? 1;
      if (qty !== pageQuantity) {
        setPageQuantity(qty);
      }
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [currentProductState, selectedVariantId, pageQuantity]);

  const { locale, currentPage, currentProduct, currentProductInfo, currentVariant } = useMemo(() => {
    const resolvedVariantId = selectedVariantId || currentProductState?.variantId || '';

    return {
      locale: window?.wixEmbedsAPI?.getLanguage?.() || '',
      currentPage: window?.estimatedCurrentPage?.pageTypeIdentifier || '',
      currentProduct: currentProductState,
      currentVariant: {
        id: resolvedVariantId,
        sku:
          window?.estimatedProductVariants?.find((v) => v.id === resolvedVariantId)?.sku ||
          currentProductState?.sku ||
          '',
      },
      currentProductInfo: {
        variants: window?.estimatedProductVariants || currentProductState?.variants || [],
        collections: window?.estimatedCurrentCollectionIds || [],
      },
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProductState, selectedVariantId]);

  return (
    <ShopifyContext.Provider
      value={{ locale, currentPage, currentProduct, currentProductInfo, currentVariant, selectedVariantId, pageQuantity }}
    >
      {children}
    </ShopifyContext.Provider>
  );
};

export { ShopifyContextProvider };
export default ShopifyContext;
