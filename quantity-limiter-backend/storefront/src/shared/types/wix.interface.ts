import { WixStockingStatus } from '@nest/shared.enum';

export interface IWixCartLineItem {
  id: number;
  key: string;
  product_id: number;
  properties: Record<string, any>;
  title: string;
  product_title?: string;
  vendor: string;
  available?: boolean;
}

export interface IWixCurrentVariant {
  id: string;
  sku: string;
}

export interface IWixPageContent {
  id: string;
  name: string;
  list: string;
  category: string;
  position: number;
  price: number;
  currency: string;
  dimension3: string;
}

export type IWixPage = {
  isPremium?: boolean;
  metaSiteId?: string;
  pageApp?: string;
  pageId?: string;
  pageNumber?: number;
  pagePath?: string;
  pageTitle?: string;
  pageType?: string;
  pageTypeIdentifier?: string;
  userId: string;
  viewer?: string;
  visitorId: string;
  _internalEventId: string;
  origin?: string;
  contents?: IWixPageContent[];
};

export interface IWixVariant {
  id: string;
  optionsSelectionsIds: number[];
  price: number;
  sku: string;
}

export type IWixProductData = {
  id: string;
  origin: string;
  name: string;
  list: string;
  category?: string;
  position: number;
  price: number;
  currency: string;
  type: string;
  sku?: string;
  visitorId: string;
  _internalEventId: string;
  userId: string;
  metaSiteId: string;
  brand?: string;
  variants?: IWixVariant[];
  variantId?: string;
  optionsSelectionsIds?: number[];
  dimension3?: WixStockingStatus;
  options?: {
    id: number;
    value: string;
  }[];
};
