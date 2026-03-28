import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity('attribute_product_variant')
@Index('shop_product_variant', ['shop', 'legacyResourceId'], { unique: true })
export class ProductVariant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  shop: string;

  @Column()
  @Index('legacyResourceId')
  legacyResourceId: string;

  @Column({ nullable: true })
  sku: string;

  @Column({ nullable: true })
  visible: boolean;

  @Column()
  displayName: string;

  @Column()
  attributesProductId: number;

  @ManyToOne(() => Product, (product) => product.variants, {
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  @JoinColumn({ foreignKeyConstraintName: 'fk_product_variant_product', name: 'attributes_product_id' })
  product?: Product;
}
