import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { CronAttributeStatus } from '../types/attributes.enum';

@Entity('attribute_cron')
@Index('attribute_cron', ['status', 'retry', 'updatedAt'])
export class AttributeCron {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index('shop_cron_unique', { unique: true })
  shop: string;

  @Column({ default: CronAttributeStatus.Pending })
  status: CronAttributeStatus;

  @Column({ default: 0 })
  retry: number;

  @Column({ type: 'text', nullable: true })
  logs: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
