import { createContext, ReactNode, useEffect, useMemo, useState } from 'react';
import { QlCurrentProduct, QlProductData } from '~/shared/types/global';
import { IShopifyContext } from './shopify-context.interface';

const ShopifyContext = createContext<undefined | IShopifyContext>(undefined);

const POLL_INTERVAL = 500;

const ShopifyContextProvider = ({ children }: { children: ReactNode }) => {
  const [currentProduct, setCurrentProduct] = useState<QlCurrentProduct | undefined>(window.qlCurrentProduct);
  const [productData, setProductData] = useState<QlProductData | undefined>(
    window.qlCurrentProduct ? window.qlProducts?.get(window.qlCurrentProduct.id) : undefined,
  );

  // Poll window globals for changes (set by analytics event handlers in main.tsx)
  useEffect(() => {
    const interval = setInterval(() => {
      const cp = window.qlCurrentProduct;

      if (JSON.stringify(cp) !== JSON.stringify(currentProduct)) {
        setCurrentProduct(cp);
        setProductData(cp ? window.qlProducts?.get(cp.id) : undefined);
      }
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [currentProduct]);

  const value = useMemo<IShopifyContext>(
    () => ({
      locale: window?.wixEmbedsAPI?.getLanguage?.() || '',
      currentPage: window?.qlCurrentPage?.pageTypeIdentifier || '',
      currentProduct,
      productData,
    }),
    [currentProduct, productData],
  );

  return <ShopifyContext.Provider value={value}>{children}</ShopifyContext.Provider>;
};

export { ShopifyContextProvider };
export default ShopifyContext;
