import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DefaultResponse } from 'src/docs/default/default-response.swagger';
import { Conjunction, SortDirection } from 'src/shared/common/types/shared.enum';
import { formatMetaResponse, formatPaginationRequest } from 'src/shared/common/utils/functions';
import { FindOptionsWhere, Like, Repository } from 'typeorm';
import { CreateRuleDto, GetRulesDto, SeedRulesDto, UpdateRuleDto } from './dto/rules.dto';
import { RuleCollection } from './entities/rule-collection.entity';
import { RuleCustomer } from './entities/rule-customer.entity';
import { RuleOrder } from './entities/rule-order.entity';
import { RuleProduct } from './entities/rule-product.entity';
import { Rule } from './entities/rule.entity';
import { GetRuleResponse, GetRulesResponse, SaveRuleResponse, SeedRulesResponse } from './response/rules.response';
import {
  NotificationTrigger,
  OrderConditionType,
  ProductSelectionType,
  RuleCustomerConditionType,
  RuleGroupProductConditionOperator,
  RuleGroupProductConditionType,
  RuleType,
} from './types/rule.enum';

@Injectable()
export class RulesService {
  constructor(
    @InjectRepository(Rule)
    private readonly ruleRepository: Repository<Rule>,
    @InjectRepository(RuleProduct)
    private readonly ruleProductRepository: Repository<RuleProduct>,
    @InjectRepository(RuleCollection)
    private readonly ruleCollectionRepository: Repository<RuleCollection>,
    @InjectRepository(RuleCustomer)
    private readonly ruleCustomerRepository: Repository<RuleCustomer>,
    @InjectRepository(RuleOrder)
    private readonly ruleOrderRepository: Repository<RuleOrder>,
  ) {}

  async getRules(payload: GetRulesDto): Promise<GetRulesResponse> {
    const { page, perPage, shop, name, type, isActive, sortDirection } = payload;
    const { skip, take } = formatPaginationRequest(page, perPage);
    const where: FindOptionsWhere<Rule> = { shop };
    if (name) {
      where.name = Like(`%${name}%`);
    }
    if (type) {
      where.type = type;
    }
    if (isActive !== undefined) {
      where.isActive = isActive;
    }
    const [rules, total] = await this.ruleRepository.findAndCount({
      where,
      skip,
      take,
      order: { createdAt: sortDirection ?? SortDirection.DESC },
    });
    return {
      code: 200,
      data: rules,
      meta: formatMetaResponse(page, perPage, total, rules.length),
    };
  }

  async getRuleById(id: string, shop: string): Promise<GetRuleResponse> {
    const rule = await this.ruleRepository.findOne({
      where: { id, shop },
    });
    if (!rule) {
      throw new NotFoundException('Rule not found');
    }
    return {
      code: 200,
      data: rule,
    };
  }

  async deleteRule(id: string, shop: string): Promise<DefaultResponse> {
    const rule = await this.ruleRepository.findOne({
      where: { id, shop },
    });
    if (!rule) {
      throw new NotFoundException('Rule not found');
    }
    await this.ruleRepository.remove(rule);
    return {
      code: 200,
      message: 'Rule deleted successfully',
    };
  }

  async createRule(payload: CreateRuleDto): Promise<SaveRuleResponse> {
    const { shop, type, ruleProduct, ruleCollection, ruleCustomer, ruleOrder, ...ruleData } = payload;
    const rule = this.ruleRepository.create({ ...ruleData, shop, type });
    const savedRule = await this.ruleRepository.save(rule);
    await this.saveRuleTypeSpecificData(savedRule.id, type, {
      ruleProduct,
      ruleCollection,
      ruleCustomer,
      ruleOrder,
    });
    const ruleWithRelations = await this.ruleRepository.findOne({
      where: { id: savedRule.id },
    });
    return {
      code: 200,
      data: ruleWithRelations,
    };
  }

  async updateRule(id: string, shop: string, payload: UpdateRuleDto): Promise<SaveRuleResponse> {
    const rule = await this.ruleRepository.findOne({ where: { id, shop } });
    if (!rule) {
      throw new NotFoundException('Rule not found');
    }
    const { type, ruleProduct, ruleCollection, ruleCustomer, ruleOrder, ...ruleData } = payload;
    const oldType = rule.type;
    if (type && type !== oldType) {
      await this.deleteOldTypeSpecificData(id, oldType);
    }
    Object.assign(rule, ruleData);
    if (type) {
      rule.type = type;
    }
    const savedRule = await this.ruleRepository.save(rule);
    if (type || ruleProduct || ruleCollection || ruleCustomer || ruleOrder) {
      await this.saveRuleTypeSpecificData(savedRule.id, type || oldType, {
        ruleProduct,
        ruleCollection,
        ruleCustomer,
        ruleOrder,
      });
    }
    const ruleWithRelations = await this.ruleRepository.findOne({
      where: { id: savedRule.id },
    });
    return {
      code: 200,
      data: ruleWithRelations,
    };
  }

  private async deleteOldTypeSpecificData(ruleId: string, oldType: RuleType): Promise<void> {
    if (oldType === RuleType.PRODUCT) {
      await this.ruleProductRepository.delete({ ruleId });
    } else if (oldType === RuleType.COLLECTION) {
      await this.ruleCollectionRepository.delete({ ruleId });
    } else if (oldType === RuleType.CUSTOMER) {
      await this.ruleCustomerRepository.delete({ ruleId });
    } else if (oldType === RuleType.ORDER) {
      await this.ruleOrderRepository.delete({ ruleId });
    }
  }

  private async saveRuleTypeSpecificData(
    ruleId: string,
    type: RuleType,
    data: {
      ruleProduct?: any;
      ruleCollection?: any;
      ruleCustomer?: any;
      ruleOrder?: any;
    },
  ): Promise<void> {
    if (type === RuleType.PRODUCT && data.ruleProduct) {
      const existingRuleProduct = await this.ruleProductRepository.findOne({ where: { ruleId } });
      if (existingRuleProduct) {
        Object.assign(existingRuleProduct, data.ruleProduct);
        await this.ruleProductRepository.save(existingRuleProduct);
      } else {
        const ruleProduct = this.ruleProductRepository.create({
          ...data.ruleProduct,
          ruleId,
        });
        await this.ruleProductRepository.save(ruleProduct);
      }
    } else if (type === RuleType.COLLECTION && data.ruleCollection) {
      const existingRuleCollection = await this.ruleCollectionRepository.findOne({ where: { ruleId } });
      if (existingRuleCollection) {
        Object.assign(existingRuleCollection, data.ruleCollection);
        await this.ruleCollectionRepository.save(existingRuleCollection);
      } else {
        const ruleCollection = this.ruleCollectionRepository.create({
          ...data.ruleCollection,
          ruleId,
        });
        await this.ruleCollectionRepository.save(ruleCollection);
      }
    } else if (type === RuleType.CUSTOMER && data.ruleCustomer) {
      const existingRuleCustomer = await this.ruleCustomerRepository.findOne({ where: { ruleId } });
      if (existingRuleCustomer) {
        Object.assign(existingRuleCustomer, data.ruleCustomer);
        await this.ruleCustomerRepository.save(existingRuleCustomer);
      } else {
        const ruleCustomer = this.ruleCustomerRepository.create({
          ...data.ruleCustomer,
          ruleId,
        });
        await this.ruleCustomerRepository.save(ruleCustomer);
      }
    } else if (type === RuleType.ORDER && data.ruleOrder) {
      const existingRuleOrder = await this.ruleOrderRepository.findOne({ where: { ruleId } });
      if (existingRuleOrder) {
        Object.assign(existingRuleOrder, data.ruleOrder);
        await this.ruleOrderRepository.save(existingRuleOrder);
      } else {
        const ruleOrder = this.ruleOrderRepository.create({
          ...data.ruleOrder,
          ruleId,
        });
        await this.ruleOrderRepository.save(ruleOrder);
      }
    }
  }

  async seedRules(payload: SeedRulesDto): Promise<SeedRulesResponse> {
    const { shop, count } = payload;
    const rulesCreated: string[] = [];
    const ruleTypes = [RuleType.PRODUCT, RuleType.COLLECTION, RuleType.CUSTOMER, RuleType.ORDER];
    for (const ruleType of ruleTypes) {
      for (let i = 1; i <= count; i++) {
        const rule = await this.createSeedRule(shop, ruleType, i);
        rulesCreated.push(rule.id);
      }
    }
    return {
      code: 200,
      data: {
        totalCreated: rulesCreated.length,
        rulesCreated,
      },
    };
  }

  private async createSeedRule(shop: string, type: RuleType, index: number): Promise<Rule> {
    const ruleName = `${type} Rule ${index}`;
    const rule = this.ruleRepository.create({
      shop,
      name: ruleName,
      type,
      isActive: index % 2 === 0,
      minQty: index,
      maxQty: index * 10,
      notifyAboutLimitWhen: NotificationTrigger.NO_NOTIFICATION,
      showContactUsInNotification: false,
      minQtyLimitMessage: `Minimum quantity is ${index}`,
      maxQtyLimitMessage: `Maximum quantity is ${index * 10}`,
      breakMultipleLimitMessage: index % 2 === 0 ? `Please order in multiples of ${index}` : null,
      contactUsButtonText: 'Contact Us',
      contactUsMessage: 'Please contact us for assistance',
    });
    const savedRule = await this.ruleRepository.save(rule);
    await this.createSeedRuleTypeSpecificData(savedRule.id, type, index);
    return savedRule;
  }

  private async createSeedRuleTypeSpecificData(ruleId: string, type: RuleType, index: number): Promise<void> {
    if (type === RuleType.PRODUCT) {
      const conditionTypes = [
        ProductSelectionType.ALL_PRODUCTS,
        ProductSelectionType.SPECIFIC_PRODUCTS,
        ProductSelectionType.GROUP_OF_PRODUCTS,
      ];
      const conditionType = conditionTypes[index % conditionTypes.length];
      const ruleProduct = this.ruleProductRepository.create({
        ruleId,
        conditionType,
        productIds:
          conditionType === ProductSelectionType.SPECIFIC_PRODUCTS
            ? [{ productId: `product-${index}-1` }, { productId: `product-${index}-2` }]
            : null,
        groupProducts:
          conditionType === ProductSelectionType.GROUP_OF_PRODUCTS
            ? [
                {
                  type: RuleGroupProductConditionType.TAG,
                  operator: RuleGroupProductConditionOperator.EQUALS,
                  value: [`tag-${index}`],
                },
              ]
            : null,
        conjunction: index % 2 === 0 ? Conjunction.AND : Conjunction.OR,
        sellProductInMultiples: index % 2 === 0,
      });
      await this.ruleProductRepository.save(ruleProduct);
    } else if (type === RuleType.COLLECTION) {
      const ruleCollection = this.ruleCollectionRepository.create({
        ruleId,
        collectionIds: [`collection-${index}-1`, `collection-${index}-2`],
      });
      await this.ruleCollectionRepository.save(ruleCollection);
    } else if (type === RuleType.CUSTOMER) {
      const conditionTypes = [RuleCustomerConditionType.ALL_CUSTOMERS, RuleCustomerConditionType.CUSTOMER_TAGS];
      const conditionType = conditionTypes[index % conditionTypes.length];
      const ruleCustomer = this.ruleCustomerRepository.create({
        ruleId,
        conditionType,
        customerTags:
          conditionType === RuleCustomerConditionType.CUSTOMER_TAGS ? [`vip-${index}`, `premium-${index}`] : null,
        excludeCustomerTags: index % 2 === 0 ? [`excluded-${index}`] : null,
      });
      await this.ruleCustomerRepository.save(ruleCustomer);
    } else if (type === RuleType.ORDER) {
      const conditionTypes = [
        OrderConditionType.TOTAL_PRODUCTS,
        OrderConditionType.TOTAL_PRICE,
        OrderConditionType.TOTAL_WEIGHT,
      ];
      const conditionType = conditionTypes[index % conditionTypes.length];
      const ruleOrder = this.ruleOrderRepository.create({
        ruleId,
        conditionType,
      });
      await this.ruleOrderRepository.save(ruleOrder);
    }
  }
}
