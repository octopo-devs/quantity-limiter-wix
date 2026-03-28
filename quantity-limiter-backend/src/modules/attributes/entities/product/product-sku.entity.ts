import { Column, Entity, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity('attribute_product_sku')
@Index('shop_product_sku', ['shop', 'product_sku'], { unique: true })
export class ProductSKU {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  shop: string;

  @Column({ name: 'product_sku' })
  product_sku: string;
}
