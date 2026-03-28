import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity('attribute_collection_product')
@Index('shop_collection_product', ['shop', 'collectionId', 'productId'], { unique: true })
export class CollectionProduct {
  @Column()
  shop: string;

  @PrimaryColumn()
  collectionId: string;

  @PrimaryColumn()
  productId: string;
}
