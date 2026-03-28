import { PricingPlan } from 'src/shared/api/types/wix-api/wix-api.enum';
import { Column } from 'typeorm';

export class DailyPlanDetail implements Record<PricingPlan, number> {
  @Column({ default: 0 })
  basic: number;

  @Column({ default: 0 })
  standard: number;

  @Column({ default: 0 })
  pro: number;

  @Column({ default: 0 })
  plus: number;
}
