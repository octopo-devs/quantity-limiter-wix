import { APP_API, APP_API_METHOD, APP_API_SERVICE } from '~/hooks/types/api.constant';
import { IApiPayload } from '~/hooks/types/api.interface';
import { objectToQuerystring } from '~/shared/utils/functions';

export const callAppApi = async <M extends APP_API_METHOD>(method: M, service: APP_API_SERVICE<M>, payload: IApiPayload) => {
  const rootLink = import.meta.env.VITE_APP_SERVER_BE_DOMAIN;
  const { data = {}, params = {}, replacePath } = payload;
  let url = APP_API[method][service] as string;
  if (!url) throw new Error(`Service ${String(service)} not found`);
  if (replacePath) {
    Object.keys(replacePath)?.forEach((key) => {
      if (!url.includes(`:${key}`)) return;
      url = url.replace(`:${key}`, replacePath[key]);
    });
  }
  const response = await fetch(`${rootLink}${url}${Object.keys(params).length > 0 ? '?' : ''}${objectToQuerystring(params)}`, {
    method,
    body: method === 'GET' ? undefined : JSON.stringify(data),
    headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
  });
  return await response.json();
};
