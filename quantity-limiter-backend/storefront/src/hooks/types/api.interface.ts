import { EAnalyticsLog } from '@nest/app.enum';

export interface ICommonResponse {
  code: number;
  status: string;
  message: string;
}

export interface IApiPayload {
  params?: Record<string, unknown>;
  replacePath?: Record<string, string>;
  data?: Record<string, unknown>;
  isUsingUrlParams?: boolean;
}

export interface ICountryResponse {
  id: number;
  name: string;
  isoCode: string;
  flag: string;
  phonecode: string;
  currency: string;
  latitude: string;
  longitude: string;
  languageCode: string;
}
export interface ITrackingData {
  shop: string;
  type: 'checkout' | 'cart';
  token: string;
  variantId: string;
  data: string;
  createdAt: string;
  updatedAt: string;
}

export interface ITrackingDataRes extends ICommonResponse {
  data: ITrackingData[];
}

export interface ILogBody {
  shop: string;
  data: { ruleId: number; logs: EAnalyticsLog }[];
}
