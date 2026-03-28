import { stringify } from '@/helpers/string';
import { dashboard } from '@wix/dashboard';
import { createClient } from '@wix/sdk';

const isEmbedded = import.meta.env.REACT_APP_ENV !== 'test' || window.location?.search?.includes('displayMode=main');
const searchParams = new URLSearchParams(
  (isEmbedded ? window.location.search : import.meta.env.REACT_APP_URL_SEARCH_PARAMS) || window.location.search,
);

export const TRULY_VALUES = ['1', 1, true, 'true', 'yes', 'y'];
export const IS_TRULY = (value: any) =>
  ['string', 'number', 'boolean'].includes(typeof value) && TRULY_VALUES.includes(value);

function getSiteIdFromInstance() {
  const instance = searchParams.get('instance');
  if (!instance) return null;

  const payloadBase64 = instance.split('.')[1];
  const payload = JSON.parse(atob(payloadBase64));

  return payload.instanceId;
}

const getUrlParams = (sParam: string): string | null => {
  return searchParams.get(sParam);
};

const getUrlParameterJson = (): string => {
  const obj: Record<string, string> = {};

  searchParams.forEach((value, key) => {
    obj[key] = value;
  });

  // Map 'store' to 'shop' if 'shop' doesn't exist
  if (!obj.shop && obj.store) {
    obj.shop = obj.store;
  }

  // Remove 'store' from the object
  delete obj.store;

  return Object.keys(obj).length ? stringify(obj) : '';
};

export const config = {
  shop: getSiteIdFromInstance() || getUrlParams('instanceId') || '',
  urlParams: getUrlParameterJson(),
  embedded: IS_TRULY(getUrlParams('embedded')),
  hmac: getUrlParams('hmac'),
  host: getUrlParams('host'),
  source: getUrlParams('source'),
  token: getUrlParams('token'),
  locale: getUrlParams('locale'),
  session: getUrlParams('session'),
  role: getUrlParams('role'),
  instance: getUrlParams('instance'),
};

// Feature flags
export const SHOW_MULTIPLES_FEATURE = false;

// Wix SDK
export const WixClient = (() => {
  if (config.embedded) {
    return createClient({
      host: dashboard.host(),
      auth: dashboard.auth(),
      modules: {
        dashboard,
      },
    });
  }
  return {} as any;
})();
