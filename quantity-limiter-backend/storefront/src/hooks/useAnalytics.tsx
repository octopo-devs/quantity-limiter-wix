import { EAnalyticsLog } from '@nest/app.enum';
import { useCallback, useEffect } from 'react';
import useAppContext from '~/context/AppContext/useAppContext';
import useShopifyContext from '~/context/ShopifyContext/useShopifyContext';
import { ILogBody } from './types/api.interface';
import useFetch from './useFetch';

interface IStorageData {
  isVisited: Record<number, number[]>;
  impressions: number[];
  hover: number[];
  click: number[];
}

const SESSION_STORAGE_KEY = 'ot-quantity-limiter-analytics';

const useAnalytics = () => {
  const { currentVariant } = useShopifyContext();
  const { rootLink, shopGeneral } = useAppContext();
  const { callAppApi } = useFetch(rootLink);

  const sendLog = useCallback(
    async ({ shop, data }: ILogBody) => {
      if (!shop || !data) return;
      try {
        await callAppApi('POST', 'SAVE_RULE_LOG', {
          data: {
            shop,
            data,
          },
        });
      } catch (error) {
        console.error(error);
      }
    },
    [callAppApi],
  );

  const handleLog = useCallback(
    (type: EAnalyticsLog, inputRuleIds: number[]) => {
      let ruleIds = inputRuleIds;
      const storageData = sessionStorage.getItem(SESSION_STORAGE_KEY)
        ? (JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY)) as IStorageData)
        : undefined;

      const updateStorageData = (key: keyof Omit<IStorageData, 'isVisited'>) => {
        ruleIds = ruleIds.filter((ruleId) => !storageData?.[key]?.includes(ruleId));
        const newData: IStorageData = {
          ...storageData,
          [key]: [...(storageData?.[key] || []), ...ruleIds],
        };
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newData));
      };

      switch (type) {
        case EAnalyticsLog.VisitorsProductPage: {
          if (!currentVariant) return;
          const currentVariantRuleIds = storageData?.isVisited?.[(currentVariant?.id || 0) + ''] ?? [];
          ruleIds = ruleIds.filter((ruleId) => !currentVariantRuleIds.includes(ruleId + ''));
          const newData: IStorageData = {
            ...storageData,
            isVisited: { ...storageData?.isVisited, [currentVariant?.id || 0]: [...currentVariantRuleIds, ...ruleIds] },
          };
          sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newData));
          break;
        }
        case EAnalyticsLog.BannerImpressions:
          updateStorageData('impressions');
          break;
        case EAnalyticsLog.HoverBannerETA:
          updateStorageData('hover');
          break;
        case EAnalyticsLog.BannerClicks:
          updateStorageData('click');
          break;
        default:
          break;
      }

      if (!ruleIds.length) return;

      const data: ILogBody['data'] = ruleIds.map((ruleId) => ({
        ruleId,
        logs: type,
      }));

      sendLog({ shop: shopGeneral?.shop, data });
    },
    [currentVariant, sendLog, shopGeneral?.shop],
  );

  const init = () => {
    const initData: IStorageData = {
      isVisited: {},
      impressions: [],
      click: [],
      hover: [],
    };
    if (sessionStorage.getItem(SESSION_STORAGE_KEY)) return;
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(initData));
  };

  useEffect(() => {
    init();
  }, []);

  const handleResetLog = () => {
    const data = sessionStorage.getItem(SESSION_STORAGE_KEY)
      ? (JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY)) as IStorageData)
      : undefined;

    const newData: IStorageData = {
      ...data,
      impressions: [],
      click: [],
      hover: [],
    };

    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newData));
  };

  return { handleLog, handleResetLog };
};

export default useAnalytics;
