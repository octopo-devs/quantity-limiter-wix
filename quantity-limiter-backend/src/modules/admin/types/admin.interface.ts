import { UpdateReportAction } from './admin.enum';

export interface IUpdateDailyAnalytic {
  shop: string;
  date: Date;
  action: UpdateReportAction;
}

export interface IShopOnboardingRecord {
  shop: string;
  maxStep: number;
}
