import { PlanSubscription, PricingPlan } from 'src/shared/api/types/wix-api/wix-api.enum';

export interface IGa4EventPayload {
  shop_name: string;
  plan?: PricingPlan;
  type?: PlanSubscription;
  shop_id?: number;
  app_name?: string;
}
