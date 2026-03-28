import { useCallback } from 'react';
import { objectToQuerystring } from '../shared/utils/functions';
import { ADMIN_API, ADMIN_API_METHOD, ADMIN_API_SERVICE, APP_API, APP_API_METHOD, APP_API_SERVICE } from './types/api.constant';
import { IApiPayload, ITrackingData, ITrackingDataRes } from './types/api.interface';

const useFetch = (rootLink: string) => {
  const callAppApi = useCallback(
    async <M extends APP_API_METHOD>(method: M, service: APP_API_SERVICE<M>, payload: IApiPayload) => {
      if (!rootLink) return console.log('Root link not found');
      const { data = {}, params = {}, replacePath } = payload;
      let url = APP_API[method][service] as string;
      if (!url) throw new Error(`Service ${String(service)} not found`);
      if (replacePath) {
        Object.keys(replacePath)?.forEach((key) => {
          if (!url.includes(`:${key}`)) return;
          url = url.replace(`:${key}`, replacePath[key]);
        });
      }
      const response = await fetch(
        `${rootLink}${url}${Object.keys(params).length > 0 ? '?' : ''}${objectToQuerystring(params)}`,
        {
          method,
          body: method === 'GET' ? undefined : JSON.stringify(data),
          headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
        },
      );
      return await response.json();
    },
    [rootLink],
  );

  const callAdminApi = useCallback(
    async <M extends ADMIN_API_METHOD>(method: M, service: ADMIN_API_SERVICE<M>, payload: IApiPayload) => {
      const { data = {}, params = {}, replacePath } = payload;
      let url = ADMIN_API[method][service] as string;
      if (!url) throw new Error(`Service ${String(service)} not found`);
      if (replacePath) {
        Object.keys(replacePath)?.forEach((key) => {
          if (!url.includes(`:${key}`)) return;
          url = url.replace(`:${key}`, replacePath[key]);
        });
      }
      const response = await fetch(`${url}?${objectToQuerystring(params)}`, {
        method,
        body: method === 'GET' ? undefined : JSON.stringify(data),
        headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
      });
      return await response.json();
    },
    [],
  );

  const updateShopifyCartItemProperty = useCallback(async (rootUrl: string, payload: string) => {
    try {
      const res = await fetch(`${rootUrl}cart/change.js`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
        body: payload,
      });
      return await res.json();
    } catch (error) {
      console.log('🚚 Error update shopify cart item property: ', error);
    }
  }, []);

  const getTrackingLog = useCallback(
    async (token: string): Promise<ITrackingDataRes> => {
      const trackingLog = await callAppApi('GET', 'GET_CART_TRACKING_LOG', { params: { token } });
      return trackingLog;
    },
    [callAppApi],
  );

  const createTrackingLog = useCallback(
    async (data: Omit<ITrackingData, 'updatedAt' | 'createdAt'>): Promise<ITrackingDataRes> => {
      console.log('createTrackingLog - data', data);
      const trackingLog = await callAppApi('POST', 'SAVE_TRACKING_LOG', { data });
      return trackingLog;
    },
    [callAppApi],
  );

  return { callAppApi, callAdminApi, updateShopifyCartItemProperty, getTrackingLog, createTrackingLog };
};

export default useFetch;
