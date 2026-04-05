import { Branding } from '~/shared/types/quantity-limit.types';

export declare class ShopGeneral {
  id: number;
  shop: string;
  custom_css: string;
  custom_position: string;
  render_method: string;
  enable_app: number;
  enableApp: number;
  date_locale: string;
  text_size: number;
  text_color: string;
  currency?: string;
  weightUnit?: string;
  branding?: Branding;
}
