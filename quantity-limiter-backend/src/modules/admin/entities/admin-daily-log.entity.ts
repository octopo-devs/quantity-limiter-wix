import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { DailyPlanDetail } from './admin-plan-detail.entity';

@Entity('admin_daily_log')
export class AdminDailyLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  @Index('created_date', { unique: true })
  createdDate: Date | string;

  @Column({ default: 0 })
  totalUser: number;

  @Column({ default: 0 })
  installedUser: number;

  @Column({ default: 0 })
  upgradeUser: number;

  @Column({ default: 0 })
  downgradeUser: number;

  @Column({ default: 0 })
  downgradeFreeUser: number;

  @Column({ default: 0 })
  uninstalledUser: number;

  @Column({ default: 0 })
  uninstallInDay: number;

  @Column({ default: 0 })
  paidUninstall: number;

  @Column({ default: 0 })
  upgradePlanInDay: number;

  @Column({ default: 0 })
  closeStore: number;

  @Column({ default: 0 })
  closeStoreInDay: number;

  @Column(() => DailyPlanDetail)
  planDetail: DailyPlanDetail;
}
