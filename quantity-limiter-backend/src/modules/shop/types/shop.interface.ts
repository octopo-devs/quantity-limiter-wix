import { IWebhookSiteUpdated } from 'src/modules/wix/types/wix.interface';
import { IShopifyThemeResponse } from 'src/shared/api/types/wix-api/wix-api.interface';

export interface IShopUpdateEvent {
  shop: string;
  payload: IWebhookSiteUpdated;
}

export interface IShopUpdateThemesEvent {
  shop: string;
  payload: {
    themes: IShopifyThemeResponse[];
  };
}
