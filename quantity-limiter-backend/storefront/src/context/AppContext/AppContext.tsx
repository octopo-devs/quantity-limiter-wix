import { ClassEnum } from '@nest/class.enum';
import { createContext, useEffect, useMemo, useState } from 'react';
import useFetch from '~/hooks/useFetch';
import { Branding, QuantityLimitRule } from '~/shared/types/quantity-limit.types';
import { IAppContext, IAppContextProviderProps } from './app-context.interface';

const AppContext = createContext<IAppContext | undefined>(undefined);

interface IState {
  shopGeneral?: any;
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
    const enableAppSetting = !!Number(shopGeneral?.enable_app);
    return { rootLink, enableAppSetting };
  }, [appMetafields]);

  const positionClass = useMemo(() => {
    let position = ClassEnum.EDDBlock as string;
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

  useEffect(() => {
    if (!metafields.data && metafields.manualData && metafields.shop && metafields.publicKey) {
      callAppApi('GET', 'GET_SHOP_METAFIELDS', {
        params: {
          shop: metafields.shop,
          key: metafields.publicKey,
        },
      }).then((res: any) => {
        window.estimatedAppMetafields = res;
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
        branding: state.branding,
        isAppEnabled,
        positionClass,
        isAllApiCalled: true,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export { AppContextProvider };

export default AppContext;
