import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { Rule } from './rule.entity';
import { RuleCustomerConditionType } from '../types/rule.enum';

@Entity('rule_customers')
export class RuleCustomer {
  @PrimaryColumn({ type: 'uuid' })
  ruleId: string;

  @OneToOne(() => Rule, (rule) => rule.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'rule_id', foreignKeyConstraintName: 'fk_rule_customer' })
  rule: Rule;

  @Column({ type: 'enum', enum: RuleCustomerConditionType, default: RuleCustomerConditionType.ALL_CUSTOMERS })
  conditionType: RuleCustomerConditionType;

  @Column({ type: 'json', nullable: true })
  customerTags: string[];

  @Column({ type: 'json', nullable: true })
  excludeCustomerTags: string[];
}
