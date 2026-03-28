import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('admin_touchpoints_log')
export class TouchpointsLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'longtext', nullable: true })
  generalTouchpoint: string;

  @Column({ type: 'date' })
  createdDate: Date | string;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  setCreatedDate() {
    this.createdDate = new Date().toISOString().split('T')[0] as any;
  }
}
