import { ShopGeneral } from '@nest/nest-types/modules/shop/entities/shop-general.entity';
import { ThemeRole } from './shoppity-api.enum';
import { IRule } from '@nest/nest-types/modules/rule/types/rule.entity';
import { IZipcodeSettings } from '@nest/nest-types/modules/shop/entities/zipcode-settings.entity';
import { ILanguage } from '@nest/nest-types/modules/shop/entities/language.entity';
export interface IShopifyPayload {
  params?: Record<string, any>;
  replacePath?: Record<string, any>;
  data?: Record<string, any>;
}
export interface IShopifyGraphQLPayload {
  querystring: string;
  variables?: Record<string, any>;
}
export interface IShopifyAuth {
  shop: string;
  accessToken?: string;
}
export interface IShopifyResponse {
  headers: any;
  data: any;
}
export interface IShopifyGraphQLResponse {
  data: any;
  extensions: {
    cost: {
      requestedQueryCost: number;
      actualQueryCost: number;
      throttleStatus: {
        maximumAvailable: number;
        currentlyAvailable: number;
        restoreRate: number;
      };
    };
  };
}
export interface IShopifyDiscountPayload {
  value?: {
    percentage: number;
  };
  durationLimitInIntervals?: number;
}
export interface IShopifyAppInstallationResponse {
  currentAppInstallation: {
    id: string;
    metafield: string;
  };
}
export interface IShopifyCreateAppMetafieldResponse {
  metafieldsSet: {
    metafields: [
      {
        id: string;
        namespace: string;
        key: string;
      },
    ];
    userErrors: [];
  };
}
export interface IShopifyAppMetafieldPayload {
  rootLink: string;
  data?: {
    settings: ShopGeneral;
    zipcodeSettings: IZipcodeSettings;
    rules: IRule[];
    languages: ILanguage[];
  };
  manualData?: boolean;
  shop?: string;
  publicKey?: string;
  isABTest: boolean;
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
export interface IShopifyAssetResponse {
  key: string;
  public_url: string;
  value: string;
  created_at: string;
  updated_at: string;
  content_type: string;
  size: number;
  checksum: string;
  theme_id: number;
  warnings: [];
}
