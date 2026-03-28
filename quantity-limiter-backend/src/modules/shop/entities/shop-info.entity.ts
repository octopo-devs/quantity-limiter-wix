import { Exclude } from 'class-transformer';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('shop_info')
@Index('shop_refresh_token', ['shop', 'refreshToken'])
export class ShopInfo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index('shop_unique', { unique: true })
  shop: string;

  @Column()
  @Exclude()
  refreshToken: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  businessName: string;

  @Column({ nullable: true })
  siteUrl: string;

  @Column({ nullable: true })
  siteId: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  zipcode: string;

  @Column({ nullable: true })
  timezone: string;

  @Column({ type: 'text' })
  shopJson: string;

  @Column({ nullable: true })
  category: string;
}
