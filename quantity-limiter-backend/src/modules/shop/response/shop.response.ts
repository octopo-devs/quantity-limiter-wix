import { DefaultPaginationResponse, DefaultResponse } from 'src/docs/default/default-response.swagger';
import { ShopGeneral } from '../entities/shop-general.entity';
import { OmitType, PartialType } from '@nestjs/swagger';

export class GetShopInfoResponse extends DefaultResponse {
  data: {
    country: string;
    email: string;
    shop: string;
    shopName: string;
    siteUrl: string;
    lastInstalledDate: Date;
  };
}

export class ShopGeneralSettingResponse extends DefaultPaginationResponse {
  data: ShopGeneralData;
}

export class ShopGeneralData extends ShopGeneral {}

export class UpdateShopGeneralSettingResponse extends DefaultResponse {
  data: ShopGeneralDataUpdate;
}

export class ShopGeneralDataUpdate extends PartialType(OmitType(ShopGeneral, ['id', 'shop'])) {}
export class GetChargeUrlResponse extends DefaultResponse {
  data?: { url: string };
}

export class ShopCrispDataResponse extends DefaultResponse {
  data?: CrispData;
}

export class CrispData {
  appName?: string;
  emailShop?: string;
  phone?: string;
  city?: string;
  country?: string;
  timezone?: string;
  firstInstalledDate?: Date;
  lastInstalledDate?: Date;
  uninstalledDate?: Date;
  wixPlan?: string;
  nameShop?: string;
  plan?: string;
  instanceId?: string;
  siteUrl?: string;
  // reviewHistory?: string;
}

export class GetEmbeddedAppStatusResponse extends DefaultResponse {
  data?: {
    disabled?: boolean;
    noAccessScope?: boolean;
  };
}

export class GetCannyTokenResponse extends DefaultResponse {
  data: {
    token: string;
  };
}

export class GetShopShippingMethodsResponse extends DefaultResponse {
  data: string[];
}

export class GetMainThemeResponse extends DefaultResponse {
  data: {
    themeName: string;
    themeStoreId: number;
  };
}

export class RedirectUpdateShopScopeResponse extends DefaultResponse {
  data: { url: string };
}
