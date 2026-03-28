import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('shop_installed')
@Index('shop_uninstalled', ['uninstalled', 'dateUninstalled'])
export class ShopInstalled {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index('shop_unique', { unique: true })
  shop: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  dateInstalled: Date;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  @Index('lastInstalledDate')
  lastInstalledDate: Date;

  @Column({ nullable: true })
  dateUninstalled: Date;

  @Column({ nullable: true })
  dateCloseStore: Date;

  @Column({ default: false })
  uninstalled: boolean;

  @Column({ default: false })
  closeStore: boolean;

  @Column({ nullable: true, type: 'text' })
  note: string;
}
