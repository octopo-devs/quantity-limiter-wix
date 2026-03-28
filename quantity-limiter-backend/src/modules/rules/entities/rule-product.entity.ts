import { Conjunction } from 'src/shared/common/types/shared.enum';
import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { ProductSelectionType } from '../types/rule.enum';
import { RuleGroupProductCondition } from '../types/rule.interface';
import { Rule } from './rule.entity';

@Entity('rule_products')
export class RuleProduct {
  @PrimaryColumn({ type: 'uuid' })
  ruleId: string;

  @OneToOne(() => Rule, (rule) => rule.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'rule_id', foreignKeyConstraintName: 'fk_rule_product' })
  rule: Rule;

  @Column({ type: 'enum', enum: ProductSelectionType, default: ProductSelectionType.ALL_PRODUCTS })
  conditionType: ProductSelectionType;

  @Column({ type: 'json', nullable: true })
  productIds: string[];

  @Column({ type: 'json', nullable: true })
  groupProducts: RuleGroupProductCondition[];

  @Column({ type: 'enum', enum: Conjunction, default: Conjunction.AND })
  conjunction: Conjunction;

  @Column({ type: 'boolean', default: false })
  sellProductInMultiples: boolean;
}
