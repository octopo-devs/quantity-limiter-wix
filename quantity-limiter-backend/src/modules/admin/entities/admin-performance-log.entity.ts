import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('admin_app_performance_log')
export class AppPerformanceLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column()
  shop: string;

  @Column()
  value: number;

  @Column()
  path: string;
}
