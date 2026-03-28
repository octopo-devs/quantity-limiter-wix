import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('attribute_collection')
@Index('shop_collection', ['shop', 'collection_id'], { unique: true })
export class Collection {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  shop: string;

  @Column()
  @Index('collection')
  collection_id: string;

  @Column()
  active: boolean;

  @Column({ nullable: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  image: string;
}
