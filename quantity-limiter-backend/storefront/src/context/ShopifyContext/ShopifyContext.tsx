import { createContext, ReactNode, useEffect, useMemo, useState } from 'react';
import { IShopifyContext } from './shopify-context.interface';

const ShopifyContext = createContext<undefined | IShopifyContext>(undefined);

const ShopifyContextProvider = ({ children }: { children: ReactNode }) => {
  const [currentProductState, setCurrentProductState] = useState(window.estimatedCurrentProduct);

  // Watch for changes in window.estimatedCurrentProduct
  useEffect(() => {
    const checkProductChange = () => {
      if (JSON.stringify(window.estimatedCurrentProduct) !== JSON.stringify(currentProductState)) {
        setCurrentProductState(window.estimatedCurrentProduct);
      }
    };

    // Check every 500ms
    const interval = setInterval(checkProductChange, 500);
    return () => clearInterval(interval);
  }, [currentProductState]);

  const { locale, currentPage, currentProduct, currentProductInfo, currentVariant } = useMemo(() => {
    const locale = window?.wixEmbedsAPI.getLanguage() || '';

    const currentPage = window?.estimatedCurrentPage?.pageTypeIdentifier || '';

    const currentProduct = window?.estimatedCurrentProduct;
    const currentVariant = {
      id: window?.estimatedCurrentProduct?.variantId || '',
      sku:
        window?.estimatedProductVariants?.find((variant) => variant.id === window?.estimatedCurrentProduct?.variantId)?.sku ||
        window?.estimatedCurrentProduct?.sku ||
        '',
    };

    const currentProductInfo = {
      variants: window?.estimatedCurrentProduct?.variants || [],
      collections: window?.estimatedCurrentCollectionIds || [],
    };
    return {
      locale,
      currentPage,
      currentProduct,
      currentProductInfo,
      currentVariant,
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProductState]);

  return (
    <ShopifyContext.Provider
      value={{
        locale,
        currentPage,
        currentProduct,
        currentProductInfo,
        currentVariant,
      }}
    >
      {children}
    </ShopifyContext.Provider>
  );
};

export { ShopifyContextProvider };

export default ShopifyContext;
