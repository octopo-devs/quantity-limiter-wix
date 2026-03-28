import { useContext } from 'react';
import ShopifyContext from './ShopifyContext';

const useShopifyContext = () => {
  const context = useContext(ShopifyContext);
  if (!context) throw new Error('useShopifyContext must be used within a ShopifyContextProvider');
  return context;
};

export default useShopifyContext;
