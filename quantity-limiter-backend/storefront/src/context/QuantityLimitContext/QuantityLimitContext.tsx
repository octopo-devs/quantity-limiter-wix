import { createContext, useMemo, ReactNode } from 'react';
import { QuantityLimitRule, QuantityLimitResult } from '~/shared/types/quantity-limit.types';
import { calculateOrderLimits } from '~/core/order-limit-calculator';
import useAppContext from '../AppContext/useAppContext';
import useShopifyContext from '../ShopifyContext/useShopifyContext';
import { IQuantityLimitContext } from './quantity-limit-context.interface';

const QuantityLimitContext = createContext<IQuantityLimitContext | undefined>(undefined);

interface Props {
  children: ReactNode;
}

const QuantityLimitContextProvider = ({ children }: Props) => {
  const { rules: appRules, shopGeneral } = useAppContext();
  const { currentProduct, currentVariant } = useShopifyContext();

  const rules = useMemo(() => (appRules || []) as unknown as QuantityLimitRule[], [appRules]);

  const results = useMemo<Record<string, QuantityLimitResult>>(() => {
    if (!rules.length || !currentProduct) return {};

    const variants =
      currentProduct?.options?.map((opt: any) => ({
        id: opt?.id || currentVariant?.id || '',
        productId: currentProduct?.id || '',
        title: opt?.title || currentProduct?.name || '',
        price: currentProduct?.price || 0,
        quantity: 1,
        weight: currentProduct?.weight || 0,
      })) || [];

    if (!variants.length && currentVariant?.id) {
      variants.push({
        id: currentVariant.id,
        productId: currentProduct?.id || '',
        title: currentProduct?.name || '',
        price: currentProduct?.price || 0,
        quantity: 1,
        weight: currentProduct?.weight || 0,
      });
    }

    if (!variants.length) return {};

    return calculateOrderLimits({
      variants,
      rules,
      shopData: {
        currency: shopGeneral?.currency || 'USD',
        weightUnit: shopGeneral?.weightUnit || 'kg',
      },
    });
  }, [rules, currentProduct, currentVariant, shopGeneral]);

  return <QuantityLimitContext.Provider value={{ rules, results }}>{children}</QuantityLimitContext.Provider>;
};

export { QuantityLimitContextProvider };
export default QuantityLimitContext;
