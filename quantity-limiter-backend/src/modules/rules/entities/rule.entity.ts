import { ShopGeneral } from 'src/modules/shop/entities/shop-general.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { NotificationTrigger, RuleType } from '../types/rule.enum';
import { RuleCollection } from './rule-collection.entity';
import { RuleCustomer } from './rule-customer.entity';
import { RuleOrder } from './rule-order.entity';
import { RuleProduct } from './rule-product.entity';

// Enums

export enum RePurchaseLimit {
  ONCE_PER_LIFETIME = 'ONCE_PER_LIFETIME',
  ONCE_PER_YEAR = 'ONCE_PER_YEAR',
  ONCE_PER_MONTH = 'ONCE_PER_MONTH',
  NO_RE_PURCHASE_LIMIT = 'NO_RE_PURCHASE_LIMIT',
  CUSTOM_TIME = 'CUSTOM_TIME',
}

// Main Entity
@Entity('rules')
@Index('idx_shop', ['shop'])
@Index('idx_created_at', ['createdAt'])
export class Rule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Store identification
  @Column({ type: 'varchar' })
  shop: string;

  @ManyToOne(() => ShopGeneral, (shopGeneral) => shopGeneral.rules, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shop', referencedColumnName: 'shop', foreignKeyConstraintName: 'fk_rules_shop' })
  shopGeneral: ShopGeneral;

  // Basic Information
  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: RuleType,
    default: RuleType.PRODUCT,
  })
  type: RuleType;

  @OneToOne(() => RuleProduct, (ruleProduct) => ruleProduct.rule, {
    nullable: true,
    cascade: true,
    eager: true,
    orphanedRowAction: 'delete',
  })
  ruleProduct: RuleProduct;

  @OneToOne(() => RuleCollection, (ruleCollection) => ruleCollection.rule, {
    nullable: true,
    cascade: true,
    eager: true,
    orphanedRowAction: 'delete',
  })
  ruleCollection: RuleCollection;

  @OneToOne(() => RuleCustomer, (ruleCustomer) => ruleCustomer.rule, {
    nullable: true,
    cascade: true,
    eager: true,
    orphanedRowAction: 'delete',
  })
  ruleCustomer: RuleCustomer;

  @OneToOne(() => RuleOrder, (ruleOrder) => ruleOrder.rule, {
    nullable: true,
    cascade: true,
    eager: true,
    orphanedRowAction: 'delete',
  })
  ruleOrder: RuleOrder;

  // Status
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  // Limit Conditions
  @Column({ type: 'int', unsigned: true })
  minQty: number;

  @Column({ type: 'int', unsigned: true })
  maxQty: number;

  // Notification Settings
  @Column({
    type: 'enum',
    enum: NotificationTrigger,
    default: NotificationTrigger.NO_NOTIFICATION,
  })
  notifyAboutLimitWhen: NotificationTrigger;

  @Column({ type: 'boolean', default: false })
  showContactUsInNotification: boolean;

  // Message Settings (English - Default Language)
  @Column({ type: 'text' })
  minQtyLimitMessage: string;

  @Column({ type: 'text' })
  maxQtyLimitMessage: string;

  @Column({ type: 'text', nullable: true })
  breakMultipleLimitMessage: string;

  @Column({ type: 'varchar', length: 255 })
  contactUsButtonText: string;

  @Column({ type: 'text' })
  contactUsMessage: string;

  // Timestamps
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // @Column({ type: 'boolean', default: true })
  // applyToEachVariant: boolean;

  // // Advanced Settings - Dates
  // @Column({ type: 'date' })
  // startDate: Date;

  // @Column({ type: 'date', nullable: true })
  // endDate: Date;

  // // Product Selection
  // @Column({
  //   type: 'enum',
  //   enum: ProductSelectionType,
  //   default: ProductSelectionType.SPECIFIC_PRODUCTS,
  // })
  // productSelectionType: ProductSelectionType;

  // @Column({ type: 'json', nullable: true })
  // selectedProductIds: string[]; // Array of Shopify product IDs

  // @Column({ type: 'json', nullable: true })
  // groupFilters: {
  //   tags?: string[];
  //   vendors?: string[];
  //   titles?: string[];
  // };

  // // Re-purchase Limit
  // @Column({
  //   type: 'enum',
  //   enum: RePurchaseLimit,
  //   default: RePurchaseLimit.NO_RE_PURCHASE_LIMIT,
  // })
  // limitCustomerRePurchase: RePurchaseLimit;

  // @Column({ type: 'int', unsigned: true, nullable: true })
  // customRePurchaseLimitDays?: number; // For CUSTOM_TIME option

  // @Column({ type: 'text', nullable: true })
  // minWeightLimitMessage: string;

  // @Column({ type: 'text', nullable: true })
  // maxWeightLimitMessage: string;

  // // Multi-language Support
  // @Column({ type: 'json', nullable: true })
  // multiLanguageMessages: {
  //   [languageCode: string]: {
  //     minQtyLimitMessage?: string;
  //     maxQtyLimitMessage?: string;
  //     minWeightLimitMessage?: string;
  //     maxWeightLimitMessage?: string;
  //     breakMultipleLimitMessage?: string;
  //     contactUsButtonText?: string;
  //     contactUsMessage?: string;
  //   };
  // };
}
