import { createContext, ReactNode, useEffect, useMemo, useState } from 'react';
import { IShopifyContext } from './shopify-context.interface';

const ShopifyContext = createContext<undefined | IShopifyContext>(undefined);

const ShopifyContextProvider = ({ children }: { children: ReactNode }) => {
  const [currentProductState, setCurrentProductState] = useState(window.qlCurrentProduct);

  // Watch for changes in window.qlCurrentProduct
  useEffect(() => {
    const checkProductChange = () => {
      if (JSON.stringify(window.qlCurrentProduct) !== JSON.stringify(currentProductState)) {
        setCurrentProductState(window.qlCurrentProduct);
      }
    };

    // Check every 500ms
    const interval = setInterval(checkProductChange, 500);
    return () => clearInterval(interval);
  }, [currentProductState]);

  const { locale, currentPage, currentProduct, currentProductInfo, currentVariant } = useMemo(() => {
    const locale = window?.wixEmbedsAPI.getLanguage() || '';

    const currentPage = window?.qlCurrentPage?.pageTypeIdentifier || '';

    const currentProduct = window?.qlCurrentProduct;
    const currentVariant = {
      id: window?.qlCurrentProduct?.variantId || '',
      sku:
        window?.qlProductVariants?.find((variant) => variant.id === window?.qlCurrentProduct?.variantId)?.sku ||
        window?.qlCurrentProduct?.sku ||
        '',
    };

    const currentProductInfo = {
      variants: window?.qlCurrentProduct?.variants || [],
      collections: window?.qlCurrentCollectionIds || [],
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
