import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('admin_daily_uninstall_log')
export class AdminDailyUninstallLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  @Index('created_date', { unique: true })
  createdDate: Date | string;

  @Column({ type: 'text', nullable: true })
  shopWebhook: string;

  @Column({ type: 'text', nullable: true })
  shopEvent: string;
}
