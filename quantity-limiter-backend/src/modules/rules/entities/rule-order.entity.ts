import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { Rule } from './rule.entity';
import { OrderConditionType } from '../types/rule.enum';

@Entity('rule_orders')
export class RuleOrder {
  @PrimaryColumn({ type: 'uuid' })
  ruleId: string;

  @OneToOne(() => Rule, (rule) => rule.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'rule_id', foreignKeyConstraintName: 'fk_rule_order' })
  rule: Rule;

  @Column({ type: 'enum', enum: OrderConditionType, default: OrderConditionType.TOTAL_PRODUCTS })
  conditionType: OrderConditionType;
}
