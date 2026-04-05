import { createContext, ReactNode, useEffect, useMemo, useState } from 'react';
import { IShopifyContext } from './shopify-context.interface';

const ShopifyContext = createContext<undefined | IShopifyContext>(undefined);

const POLL_INTERVAL = 500;

const ShopifyContextProvider = ({ children }: { children: ReactNode }) => {
  const [currentProductState, setCurrentProductState] = useState(window.qlCurrentProduct);
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(
    window.qlCurrentProduct?.variantId,
  );
  const [pageQuantity, setPageQuantity] = useState<number>(window.qlQuantityOnPage ?? 1);

  // Poll window globals for changes (set by analytics event handlers in main.tsx)
  useEffect(() => {
    const interval = setInterval(() => {
      const current = window.qlCurrentProduct;

      if (JSON.stringify(current) !== JSON.stringify(currentProductState)) {
        setCurrentProductState(current);
        if (current?.variantId !== selectedVariantId) {
          setSelectedVariantId(current?.variantId);
        }
      }

      const qty = window.qlQuantityOnPage ?? 1;
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
      currentPage: window?.qlCurrentPage?.pageTypeIdentifier || '',
      currentProduct: currentProductState,
      currentVariant: {
        id: resolvedVariantId,
        sku:
          window?.qlProductVariants?.find((v) => v.id === resolvedVariantId)?.sku ||
          currentProductState?.sku ||
          '',
      },
      currentProductInfo: {
        variants: window?.qlProductVariants || currentProductState?.variants || [],
        collections: window?.qlCurrentCollectionIds || [],
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
