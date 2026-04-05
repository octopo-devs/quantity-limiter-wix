import { useCallback } from 'react';
import { objectToQuerystring } from '../shared/utils/functions';
import { APP_API, APP_API_METHOD, APP_API_SERVICE } from './types/api.constant';
import { IApiPayload } from './types/api.interface';

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

  return { callAppApi };
};

export default useFetch;
