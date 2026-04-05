import { ClassEnum } from '@nest/class.enum';
import { ILanguage } from '../../shared/types/nest-types/modules/shop/entities/language.entity';
import { ShopGeneral } from '../../shared/types/nest-types/modules/shop/entities/shop-general.entity';
import { IShopifyAppMetafieldPayload } from '../../shared/types/nest-types/shared/api/types/shopify-api/shopify-api.interface';
import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import useFetch from '~/hooks/useFetch';
import { Branding, QuantityLimitRule } from '~/shared/types/quantity-limit.types';
import { IAppContext, IAppContextProviderProps } from './app-context.interface';

const AppContext = createContext<IAppContext | undefined>(undefined);

interface IState {
  shopGeneral?: ShopGeneral;
  rules: QuantityLimitRule[];
  branding?: Branding;
}

const AppContextProvider = ({ children, metafields }: IAppContextProviderProps) => {
  const [state, setState] = useState<IState>({
    shopGeneral: metafields.data?.settings,
    rules: metafields.data?.rules || [],
    branding: metafields.data?.branding || metafields.data?.settings?.branding || undefined,
  });

  const { callAppApi } = useFetch(metafields.rootLink);

  const [appMetafields, setAppMetafields] = useState(metafields);

  const { rootLink, enableAppSetting } = useMemo(() => {
    const shopGeneral = appMetafields?.data?.settings;
    const rules = appMetafields?.data?.rules || [];
    const branding = appMetafields?.data?.branding || shopGeneral?.branding || undefined;
    setState((prev) => ({
      ...prev,
      shopGeneral,
      rules,
      branding,
    }));
    const rootLink = appMetafields?.rootLink;
    const enableAppSetting = !!Number(shopGeneral?.enableApp);
    return { rootLink, enableAppSetting };
  }, [appMetafields]);

  const shopData = useMemo(
    () => ({
      currency: state.shopGeneral?.currency || 'USD',
      weightUnit: state.shopGeneral?.weightUnit || 'kg',
    }),
    [state.shopGeneral],
  );

  const positionClass = useMemo(() => {
    let position = ClassEnum.DefaultBlock as string;
    if (state?.shopGeneral?.custom_position) {
      position = state.shopGeneral.custom_position;
    }
    return position;
  }, [state?.shopGeneral?.custom_position]);

  const isAppEnabled = useMemo(() => {
    if (!state?.shopGeneral) return false;
    if (!enableAppSetting) return false;
    return true;
  }, [state?.shopGeneral, enableAppSetting]);

  const languages = useMemo<ILanguage[]>(() => {
    return appMetafields?.data?.languages || [];
  }, [appMetafields]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleChangeSettingsLanguage = useCallback((_language: ILanguage) => {
    // Language change handling — can be extended as needed
  }, []);

  useEffect(() => {
    if (!metafields.data && metafields.manualData && metafields.shop && metafields.publicKey) {
      callAppApi('GET', 'GET_SHOP_METAFIELDS', {
        params: {
          shop: metafields.shop,
          key: metafields.publicKey,
        },
      }).then((res: IShopifyAppMetafieldPayload) => {
        window.qlAppMetafields = res;
        setAppMetafields(res);
      });
    }
  }, [callAppApi, metafields]);

  return (
    <AppContext.Provider
      value={{
        rootLink,
        shopGeneral: state?.shopGeneral,
        rules: state.rules,
        shopData,
        branding: state.branding,
        isAppEnabled,
        positionClass,
        isAllApiCalled: true,
        languages,
        handleChangeSettingsLanguage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export { AppContextProvider };

export default AppContext;
