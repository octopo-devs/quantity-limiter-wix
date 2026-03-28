import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RulesService } from './rules.service';
import { RulesController } from './rules.controller';
import { Rule } from './entities/rule.entity';
import { RuleProduct } from './entities/rule-product.entity';
import { RuleCollection } from './entities/rule-collection.entity';
import { RuleCustomer } from './entities/rule-customer.entity';
import { RuleOrder } from './entities/rule-order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Rule, RuleProduct, RuleCollection, RuleCustomer, RuleOrder])],
  providers: [RulesService],
  controllers: [RulesController],
})
export class RulesModule {}
