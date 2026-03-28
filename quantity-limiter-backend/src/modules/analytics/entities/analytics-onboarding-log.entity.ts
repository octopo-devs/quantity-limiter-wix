import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('admin_app_onboarding_log')
export class AppOnboardingLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column()
  shop: string;

  @Column()
  step: number;

  @Column()
  start_time: Date;

  @Column({ nullable: true })
  end_time?: Date;

  @Column({ default: false })
  finished_onboarding: boolean;
}
