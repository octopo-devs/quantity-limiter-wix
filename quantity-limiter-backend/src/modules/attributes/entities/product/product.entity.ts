import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ProductVariant } from './product-variant.entity';

@Entity('attribute_product')
@Index('shop_product', ['shop', 'product_id'], { unique: true })
@Index('product_brand', ['shop', 'brand'])
@Index('product_ribbon', ['shop', 'ribbon'])
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  shop: string;

  @Column()
  @Index('product_id')
  product_id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  ribbon: string;

  @Column({ nullable: true })
  brand: string;

  @Column({ nullable: true })
  productType: string;

  @Column({ type: 'text', nullable: true })
  image: string;

  @Column({ nullable: true })
  visible: boolean;

  // @Column({ type: 'text', nullable: true })
  // handle: string;

  // @Column({ nullable: true })
  // templateSuffix: string;

  // @Column({ type: 'text', nullable: true })
  // tags: string;

  // @Column({ nullable: true })
  // adminGraphqlApiId: string;

  // @Column({ type: 'longtext', nullable: true })
  // metafields: string;

  @OneToMany(() => ProductVariant, (variant) => variant.product, { cascade: true })
  variants?: ProductVariant[];
}
