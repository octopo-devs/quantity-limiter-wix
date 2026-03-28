import * as qs from 'qs';
import { DefaultMetaResponse } from 'src/docs/default/default-response.swagger';
import { MONTH_NAME, TEST_SHOPS } from '../types/shared.constant';
import { ShopInfo } from 'src/modules/shop/entities/shop-info.entity';
import * as crypto from 'crypto';

export const formatDateString = (time?: Date | number | string, format: string = 'yyyy-mm-dd') => {
  let timestamp = new Date(time).getTime();
  if (!timestamp || !time) timestamp = Date.now();
  const date = new Date(timestamp);
  const year = String(date.getFullYear());
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);
  const monthName = MONTH_NAME[date.getMonth() + 1];
  format = format.replace('yyyy', year);
  format = format.replace('mm', month);
  format = format.replace('mn', monthName);
  format = format.replace('dd', day);
  return format;
};

export const unixTimestamp = (time?: Date | number | string): number => {
  let timestamp = new Date(time).getTime();
  if (!timestamp || !time) timestamp = Date.now();
  return Math.floor(timestamp / 1000);
};

export const objectToQuerystring = (obj = {}) => {
  return qs.stringify(obj);
};

export const parseQueryFromUrl = (url: string): Record<string, any> => {
  let querystring: string;
  const query = {};
  try {
    querystring = new URL(url).search;
  } catch (e) {
    return null;
  }
  const pairs = (querystring[0] === '?' ? querystring.substr(1) : querystring).split('&');
  for (let i = 0; i < pairs.length; i++) {
    const [key, value] = pairs[i].split('=');
    query[decodeURIComponent(key)] = decodeURIComponent(value || '');
  }
  return query;
};

export const formatMetaResponse = (
  page: number,
  perPage: number,
  total: number,
  count: number,
): DefaultMetaResponse => {
  let totalPages = 1;
  if (perPage > 0) totalPages = Math.ceil(total / perPage);
  return { pagination: { count, currentPage: page, perPage, total, totalPages } };
};

export const formatPaginationRequest = (page: number, perPage: number): { skip: number; take?: number } => {
  const skip = Math.max((page - 1) * perPage, 0);
  const take = perPage === -1 ? undefined : perPage;
  return { skip, take };
};

export const isTestShop = (shopInfo: ShopInfo): boolean => {
  const { shop, email } = shopInfo || {};
  if (TEST_SHOPS.includes(shop)) return true;
  else if (email?.includes('@avada.com')) return true;
  return false;
};

export const getDifferenceInDays = (givenDate: Date, targetDate: Date): number => {
  const differenceMs = Math.abs(givenDate.getTime() - targetDate.getTime());

  const differenceDays = differenceMs / (1000 * 60 * 60 * 24);

  return differenceDays;
};

export const generateHmacKey = (querystring: string, secret: string): string => {
  const generateHmac = crypto.createHmac('sha256', secret).update(querystring).digest('hex');
  return generateHmac;
};

export const removeHtmlTag = (text: string): string => {
  if (!text) return '';
  const result = text.replace(/&nbsp;/g, ' ').replace(/<[^>]+>/g, '');

  return result;
};

export const unixTimestampToDate = (unixTimestamp: number): Date => {
  return new Date(unixTimestamp * 1000);
};

export function safeJsonParse(data: string, isMetafield?: boolean): any {
  try {
    let dataParsed = JSON.parse(data);
    if (dataParsed?.length && isMetafield) {
      dataParsed = dataParsed.map((item: any) => {
        if (item?.data) {
          try {
            const dataNewParsed = JSON.parse(item.data);
            return { ...item, data: dataNewParsed };
          } catch (error) {
            return item;
          }
        }
        return item;
      });
    }
    return dataParsed || [];
  } catch (error) {
    return [];
  }
}

export const safeJsonParseObject = (data: string): Record<string, any> => {
  try {
    return JSON.parse(data) || {};
  } catch (error) {
    return {};
  }
};

export const removeEmptyRepeatStrings = (array: string[]): string[] => {
  if (!array || !Array.isArray(array)) return [];
  return Array.from(new Set(array.filter((item) => item !== '')));
};

export function removeAccents(str: string): string {
  try {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  } catch (error) {
    console.error('Error in removeAccents:', error);
    return str;
  }
}
