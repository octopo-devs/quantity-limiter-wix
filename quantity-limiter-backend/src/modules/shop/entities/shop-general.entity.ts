import { Branding } from 'src/modules/branding/entities/branding.entity';
import { Rule } from 'src/modules/rules/entities/rule.entity';
import { PlanSubscription, PricingPlan } from 'src/shared/api/types/wix-api/wix-api.enum';
import { Column, Entity, Index, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('shop_general')
export class ShopGeneral {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index('shop_unique', { unique: true })
  shop: string;

  @Column({ default: 0 })
  lastAccess: number;

  @Column({ default: PricingPlan.Free })
  oldPlan: PricingPlan;

  @Column()
  plan: PricingPlan;

  @Column({ nullable: true })
  planExpiredAt: Date;

  @Column({ default: PlanSubscription.Monthly })
  subscription: PlanSubscription;

  @Column()
  planUpdatedAt: number;

  @Column({ default: false })
  hasScript: boolean;

  @Column({ default: true })
  displayOnboarding: boolean;

  @Column({ type: 'tinyint', default: 1 })
  enableApp: number;

  @Column({ nullable: true })
  dateLocale: string;

  @Column({ nullable: true })
  cannyId: string;

  @OneToOne(() => Branding, (branding) => branding.shopGeneral)
  branding: Branding;

  @OneToMany(() => Rule, (rule) => rule.shopGeneral)
  rules: Rule[];
}
