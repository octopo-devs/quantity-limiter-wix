import { ShopGeneral } from 'src/modules/shop/entities/shop-general.entity';
import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { DisplayType, TextAlign } from '../types/branding.enum';

@Entity('branding')
export class Branding {
  @PrimaryColumn({ type: 'varchar' })
  shop: string;

  @OneToOne(() => ShopGeneral, (shopGeneral) => shopGeneral.branding, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shop', referencedColumnName: 'shop', foreignKeyConstraintName: 'fk_branding_shop' })
  shopGeneral: ShopGeneral;

  /** display */
  @Column({
    type: 'enum',
    enum: DisplayType,
    default: DisplayType.INLINE,
  })
  displayType: DisplayType;

  /** styling */
  @Column({ type: 'varchar', length: 20, default: '#FFD466' })
  backgroundColor: string;

  @Column({ type: 'varchar', length: 20, default: '#4A4A4A' })
  textColor: string;

  @Column({ nullable: true })
  fontFamily: string;

  @Column({
    type: 'enum',
    enum: TextAlign,
    default: TextAlign.LEFT,
  })
  textAlign: TextAlign;

  @Column({ type: 'int', unsigned: true, default: 14 })
  fontSize: number;

  @Column({ type: 'mediumtext', nullable: true })
  customCss: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
