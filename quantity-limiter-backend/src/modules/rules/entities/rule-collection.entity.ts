import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { Rule } from './rule.entity';

@Entity('rule_collections')
export class RuleCollection {
  @PrimaryColumn({ type: 'uuid' })
  ruleId: string;

  @OneToOne(() => Rule, (rule) => rule.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'rule_id', foreignKeyConstraintName: 'fk_rule_collection' })
  rule: Rule;

  @Column({ type: 'json', nullable: true })
  collectionIds: string[];
}
