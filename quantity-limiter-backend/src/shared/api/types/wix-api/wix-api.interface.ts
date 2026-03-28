import { Branding } from 'src/modules/branding/entities/branding.entity';
import { Rule } from 'src/modules/rules/entities/rule.entity';
import { ShopGeneral } from 'src/modules/shop/entities/shop-general.entity';
import { WixAppInstance } from 'src/modules/wix/types/wix.interface';
import { ThemeRole } from './wix-api.enum';

export interface IShopifyAppMetafieldPayloadRule {
  rootLink: string;
  data?: {
    settings: ShopGeneral;
    branding?: Branding;
    rules?: Rule[];
  };
  isABTest: boolean;
  manualData?: boolean;
  publicKey?: string;
  shop?: string;
}

export interface IShopifyThemeResponse {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  role: ThemeRole;
  theme_store_id: number;
  previewable: boolean;
  processing: boolean;
  admin_graphql_api_id: string;
}

//new wix

export interface IGetAccessTokenPayload {
  client_id: string;
  client_secret: string;
  grant_type: 'authorization_code' | 'refresh_token' | 'client_credentials';
  code?: string;
  refresh_token?: string;
  instance_id?: string;
}

export interface IGetOAuthAccessTokenPayload {
  client_id: string;
  client_secret: string;
  grant_type: 'client_credentials';
  instance_id?: string;
}

export interface IGetAccessTokenResponse {
  access_token: string;
  refresh_token: string;
}

export interface IApiAuth {
  accessToken?: string;
  refreshToken?: string;
}

export interface IApiPayload {
  param?: string;
  [key: string]: any;
}

export interface ISupportedLanguage {
  languageCode: string;
  locale: ISiteLocale;
  isPrimary: boolean;
  countryCode: string;
  resolutionMethod: 'QUERY_PARAM' | 'SUBDOMAIN' | 'SUBDIRECTORY';
}

export interface ISiteLocale {
  languageCode: string;
  country: string;
}

export interface IAppInstanceResponse {
  instance: WixAppInstance;
  site: {
    siteDisplayName: string;
    locale: string;
    paymentCurrency: string;
    multilingual: {
      isMultiLingual: boolean;
      supportedLanguages: ISupportedLanguage[];
    };
    url?: string;
    description?: string;
    installedWixApps: string[];
    ownerInfo: {
      email: string;
      emailStatus: string;
    };
    siteId: string;
  };
}

export interface ISiteProperties {
  version: string;
  properties: {
    categories?: { primary: string; secondary: string[] };
    locale: ISiteLocale;
    language: string;
    paymentCurrency: string;
    timeZone: string;
    email?: string;
    phone?: string;
    fax?: string;
    address: {
      street?: string;
      city?: string;
      country: string;
      state?: string;
      zip?: string;
      hint?: {
        text: string;
        placement: string;
      };
      isPhysical: boolean;
      googleFormattedAddress?: string;
      streetNumber?: string;
      apartmentNumber?: string;
      coordinates?: { latitude: number; longitude: number };
    };
    siteDisplayName: string;
    businessName?: string;
    logo?: string;
    description?: string;
    multilingual?: {
      supportedLanguages: ISupportedLanguage[];
      autoRedirect: boolean;
    };
    consentPolicy?: {
      essential: boolean;
      functional: boolean;
      analytics: boolean;
      advertising: boolean;
      dataToThirdParty: boolean;
    };
    businessConfig: 'FITNESS SERVICE' | 'RESTAURANT' | 'BLOG' | 'STORE' | 'EVENT' | 'UNKNOWN';
    trackClicksAnalytics: boolean;
  };
}
