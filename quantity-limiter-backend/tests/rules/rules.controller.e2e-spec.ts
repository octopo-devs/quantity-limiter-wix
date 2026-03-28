import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../../src/app.module';
import { Rule } from '../../src/modules/rules/entities/rule.entity';
import {
  NotificationTrigger,
  OrderConditionType,
  ProductSelectionType,
  RuleCustomerConditionType,
  RuleGroupProductConditionOperator,
  RuleGroupProductConditionType,
  RuleType,
} from '../../src/modules/rules/types/rule.enum';
import { Conjunction } from '../../src/shared/common/types/shared.enum';

describe('RulesController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  const testShop = 'test-shop-e2e';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    dataSource = moduleFixture.get<DataSource>(DataSource);
    await app.init();
  });

  afterAll(async () => {
    if (dataSource && dataSource.isInitialized) {
      const ruleRepository = dataSource.getRepository(Rule);
      const rules = await ruleRepository.find({ where: { shop: testShop } });
      if (rules.length > 0) {
        await ruleRepository.remove(rules);
      }
      await dataSource.destroy();
    }
    await app.close();
  });

  describe('POST /rules', () => {
    it('should create a PRODUCT rule', async () => {
      const createRuleDto = {
        shop: testShop,
        name: 'Test Product Rule',
        type: RuleType.PRODUCT,
        isActive: true,
        minQty: 1,
        maxQty: 10,
        notifyAboutLimitWhen: NotificationTrigger.NO_NOTIFICATION,
        showContactUsInNotification: false,
        minQtyLimitMessage: 'Minimum quantity is {minQty}',
        maxQtyLimitMessage: 'Maximum quantity is {maxQty}',
        breakMultipleLimitMessage: 'Please order in multiples of {multiple}',
        contactUsButtonText: 'Contact Us',
        contactUsMessage: 'Please contact us for assistance',
        ruleProduct: {
          conditionType: ProductSelectionType.SPECIFIC_PRODUCTS,
          productIds: ['product-1', 'product-2'],
          conjunction: Conjunction.AND,
          sellProductInMultiples: true,
        },
      };

      const response = await request(app.getHttpServer()).post('/rules').send(createRuleDto).expect(201);

      expect(response.body.code).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.name).toBe(createRuleDto.name);
      expect(response.body.data.type).toBe(RuleType.PRODUCT);
      expect(response.body.data.ruleProduct).toBeDefined();
      expect(response.body.data.ruleProduct.conditionType).toBe(ProductSelectionType.SPECIFIC_PRODUCTS);
      expect(response.body.data.ruleProduct.productIds).toEqual(createRuleDto.ruleProduct.productIds);
    });

    it('should create a COLLECTION rule', async () => {
      const createRuleDto = {
        shop: testShop,
        name: 'Test Collection Rule',
        type: RuleType.COLLECTION,
        isActive: true,
        minQty: 2,
        maxQty: 20,
        notifyAboutLimitWhen: NotificationTrigger.LIMIT_REACHED,
        showContactUsInNotification: true,
        minQtyLimitMessage: 'Minimum quantity is {minQty}',
        maxQtyLimitMessage: 'Maximum quantity is {maxQty}',
        contactUsButtonText: 'Contact Us',
        contactUsMessage: 'Please contact us for assistance',
        ruleCollection: {
          collectionIds: ['collection-1', 'collection-2'],
        },
      };

      const response = await request(app.getHttpServer()).post('/rules').send(createRuleDto).expect(201);

      expect(response.body.code).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.name).toBe(createRuleDto.name);
      expect(response.body.data.type).toBe(RuleType.COLLECTION);
      expect(response.body.data.ruleCollection).toBeDefined();
      expect(response.body.data.ruleCollection.collectionIds).toEqual(createRuleDto.ruleCollection.collectionIds);
    });

    it('should create a CUSTOMER rule', async () => {
      const createRuleDto = {
        shop: testShop,
        name: 'Test Customer Rule',
        type: RuleType.CUSTOMER,
        isActive: true,
        minQty: 3,
        maxQty: 30,
        notifyAboutLimitWhen: NotificationTrigger.ADD_TO_CART_BUTTON_CLICKED,
        showContactUsInNotification: false,
        minQtyLimitMessage: 'Minimum quantity is {minQty}',
        maxQtyLimitMessage: 'Maximum quantity is {maxQty}',
        contactUsButtonText: 'Contact Us',
        contactUsMessage: 'Please contact us for assistance',
        ruleCustomer: {
          conditionType: RuleCustomerConditionType.CUSTOMER_TAGS,
          customerTags: ['vip', 'premium'],
          excludeCustomerTags: ['excluded'],
        },
      };

      const response = await request(app.getHttpServer()).post('/rules').send(createRuleDto).expect(201);

      expect(response.body.code).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.name).toBe(createRuleDto.name);
      expect(response.body.data.type).toBe(RuleType.CUSTOMER);
      expect(response.body.data.ruleCustomer).toBeDefined();
      expect(response.body.data.ruleCustomer.conditionType).toBe(RuleCustomerConditionType.CUSTOMER_TAGS);
      expect(response.body.data.ruleCustomer.customerTags).toEqual(createRuleDto.ruleCustomer.customerTags);
    });

    it('should create an ORDER rule', async () => {
      const createRuleDto = {
        shop: testShop,
        name: 'Test Order Rule',
        type: RuleType.ORDER,
        isActive: true,
        minQty: 4,
        maxQty: 40,
        notifyAboutLimitWhen: NotificationTrigger.NO_NOTIFICATION,
        showContactUsInNotification: false,
        minQtyLimitMessage: 'Minimum quantity is {minQty}',
        maxQtyLimitMessage: 'Maximum quantity is {maxQty}',
        contactUsButtonText: 'Contact Us',
        contactUsMessage: 'Please contact us for assistance',
        ruleOrder: {
          conditionType: OrderConditionType.TOTAL_PRODUCTS,
        },
      };

      const response = await request(app.getHttpServer()).post('/rules').send(createRuleDto).expect(201);

      expect(response.body.code).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.name).toBe(createRuleDto.name);
      expect(response.body.data.type).toBe(RuleType.ORDER);
      expect(response.body.data.ruleOrder).toBeDefined();
      expect(response.body.data.ruleOrder.conditionType).toBe(OrderConditionType.TOTAL_PRODUCTS);
    });

    it('should create a PRODUCT rule with GROUP_OF_PRODUCTS', async () => {
      const createRuleDto = {
        shop: testShop,
        name: 'Test Group Products Rule',
        type: RuleType.PRODUCT,
        isActive: true,
        minQty: 5,
        maxQty: 50,
        notifyAboutLimitWhen: NotificationTrigger.NO_NOTIFICATION,
        showContactUsInNotification: false,
        minQtyLimitMessage: 'Minimum quantity is {minQty}',
        maxQtyLimitMessage: 'Maximum quantity is {maxQty}',
        contactUsButtonText: 'Contact Us',
        contactUsMessage: 'Please contact us for assistance',
        ruleProduct: {
          conditionType: ProductSelectionType.GROUP_OF_PRODUCTS,
          groupProducts: [
            {
              type: RuleGroupProductConditionType.TAG,
              operator: RuleGroupProductConditionOperator.EQUALS,
              value: ['tag-1', 'tag-2'],
            },
          ],
          conjunction: Conjunction.OR,
          sellProductInMultiples: false,
        },
      };

      const response = await request(app.getHttpServer()).post('/rules').send(createRuleDto).expect(201);

      expect(response.body.code).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.ruleProduct).toBeDefined();
      expect(response.body.data.ruleProduct.conditionType).toBe(ProductSelectionType.GROUP_OF_PRODUCTS);
      expect(response.body.data.ruleProduct.groupProducts).toBeDefined();
      expect(response.body.data.ruleProduct.groupProducts[0].type).toBe(RuleGroupProductConditionType.TAG);
    });
  });

  describe('GET /rules', () => {
    let createdRuleId: string;

    beforeAll(async () => {
      const createRuleDto = {
        shop: testShop,
        name: 'Test Get Rules',
        type: RuleType.PRODUCT,
        isActive: true,
        minQty: 1,
        maxQty: 10,
        notifyAboutLimitWhen: NotificationTrigger.NO_NOTIFICATION,
        showContactUsInNotification: false,
        minQtyLimitMessage: 'Minimum quantity is {minQty}',
        maxQtyLimitMessage: 'Maximum quantity is {maxQty}',
        contactUsButtonText: 'Contact Us',
        contactUsMessage: 'Please contact us for assistance',
        ruleProduct: {
          conditionType: ProductSelectionType.ALL_PRODUCTS,
        },
      };

      const response = await request(app.getHttpServer()).post('/rules').send(createRuleDto).expect(201);
      createdRuleId = response.body.data.id;
    });

    it('should get list of rules with pagination', async () => {
      const response = await request(app.getHttpServer()).get(`/rules?shop=${testShop}&page=1&perPage=10`).expect(200);

      expect(response.body.code).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.meta).toBeDefined();
      expect(response.body.meta.total).toBeGreaterThanOrEqual(1);
    });

    it('should filter rules by name', async () => {
      const response = await request(app.getHttpServer())
        .get(`/rules?shop=${testShop}&name=Test Get Rules`)
        .expect(200);

      expect(response.body.code).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
      expect(response.body.data[0].name).toContain('Test Get Rules');
    });

    it('should filter rules by type', async () => {
      const response = await request(app.getHttpServer())
        .get(`/rules?shop=${testShop}&type=${RuleType.PRODUCT}`)
        .expect(200);

      expect(response.body.code).toBe(200);
      expect(response.body.data).toBeDefined();
      response.body.data.forEach((rule: Rule) => {
        expect(rule.type).toBe(RuleType.PRODUCT);
      });
    });

    it('should filter rules by isActive', async () => {
      const response = await request(app.getHttpServer()).get(`/rules?shop=${testShop}&isActive=true`).expect(200);

      expect(response.body.code).toBe(200);
      expect(response.body.data).toBeDefined();
      response.body.data.forEach((rule: Rule) => {
        expect(rule.isActive).toBe(true);
      });
    });
  });

  describe('GET /rules/:id', () => {
    let createdRuleId: string;

    beforeAll(async () => {
      const createRuleDto = {
        shop: testShop,
        name: 'Test Get Rule By Id',
        type: RuleType.PRODUCT,
        isActive: true,
        minQty: 1,
        maxQty: 10,
        notifyAboutLimitWhen: NotificationTrigger.NO_NOTIFICATION,
        showContactUsInNotification: false,
        minQtyLimitMessage: 'Minimum quantity is {minQty}',
        maxQtyLimitMessage: 'Maximum quantity is {maxQty}',
        contactUsButtonText: 'Contact Us',
        contactUsMessage: 'Please contact us for assistance',
        ruleProduct: {
          conditionType: ProductSelectionType.ALL_PRODUCTS,
        },
      };

      const response = await request(app.getHttpServer()).post('/rules').send(createRuleDto).expect(201);
      createdRuleId = response.body.data.id;
    });

    it('should get rule by id', async () => {
      const response = await request(app.getHttpServer()).get(`/rules/${createdRuleId}?shop=${testShop}`).expect(200);

      expect(response.body.code).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBe(createdRuleId);
      expect(response.body.data.name).toBe('Test Get Rule By Id');
    });

    it('should return 404 for non-existent rule', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      await request(app.getHttpServer()).get(`/rules/${fakeId}?shop=${testShop}`).expect(404);
    });
  });

  describe('PUT /rules/:id', () => {
    let createdRuleId: string;

    beforeAll(async () => {
      const createRuleDto = {
        shop: testShop,
        name: 'Test Update Rule',
        type: RuleType.PRODUCT,
        isActive: true,
        minQty: 1,
        maxQty: 10,
        notifyAboutLimitWhen: NotificationTrigger.NO_NOTIFICATION,
        showContactUsInNotification: false,
        minQtyLimitMessage: 'Minimum quantity is {minQty}',
        maxQtyLimitMessage: 'Maximum quantity is {maxQty}',
        contactUsButtonText: 'Contact Us',
        contactUsMessage: 'Please contact us for assistance',
        ruleProduct: {
          conditionType: ProductSelectionType.ALL_PRODUCTS,
        },
      };

      const response = await request(app.getHttpServer()).post('/rules').send(createRuleDto).expect(201);
      createdRuleId = response.body.data.id;
    });

    it('should update rule', async () => {
      const updateRuleDto = {
        name: 'Updated Rule Name',
        isActive: false,
        minQty: 5,
        maxQty: 50,
        ruleProduct: {
          conditionType: ProductSelectionType.SPECIFIC_PRODUCTS,
          productIds: ['product-updated-1', 'product-updated-2'],
        },
      };

      const response = await request(app.getHttpServer())
        .put(`/rules/${createdRuleId}?shop=${testShop}`)
        .send(updateRuleDto)
        .expect(200);

      expect(response.body.code).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.name).toBe(updateRuleDto.name);
      expect(response.body.data.isActive).toBe(updateRuleDto.isActive);
      expect(response.body.data.minQty).toBe(updateRuleDto.minQty);
      expect(response.body.data.maxQty).toBe(updateRuleDto.maxQty);
      expect(response.body.data.ruleProduct.productIds).toEqual(updateRuleDto.ruleProduct.productIds);
    });

    it('should update rule type from PRODUCT to COLLECTION', async () => {
      const createRuleDto = {
        shop: testShop,
        name: 'Test Type Change Rule',
        type: RuleType.PRODUCT,
        isActive: true,
        minQty: 1,
        maxQty: 10,
        notifyAboutLimitWhen: NotificationTrigger.NO_NOTIFICATION,
        showContactUsInNotification: false,
        minQtyLimitMessage: 'Minimum quantity is {minQty}',
        maxQtyLimitMessage: 'Maximum quantity is {maxQty}',
        contactUsButtonText: 'Contact Us',
        contactUsMessage: 'Please contact us for assistance',
        ruleProduct: {
          conditionType: ProductSelectionType.ALL_PRODUCTS,
        },
      };

      const createResponse = await request(app.getHttpServer()).post('/rules').send(createRuleDto).expect(201);
      const ruleId = createResponse.body.data.id;

      const updateRuleDto = {
        type: RuleType.COLLECTION,
        ruleCollection: {
          collectionIds: ['collection-updated-1'],
        },
      };

      const response = await request(app.getHttpServer())
        .put(`/rules/${ruleId}?shop=${testShop}`)
        .send(updateRuleDto)
        .expect(200);

      expect(response.body.code).toBe(200);
      expect(response.body.data.type).toBe(RuleType.COLLECTION);
      expect(response.body.data.ruleCollection).toBeDefined();
      expect(response.body.data.ruleCollection.collectionIds).toEqual(updateRuleDto.ruleCollection.collectionIds);
      expect(response.body.data.ruleProduct).toBeUndefined();
    });

    it('should return 404 for non-existent rule', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const updateRuleDto = {
        name: 'Updated Name',
      };

      await request(app.getHttpServer()).put(`/rules/${fakeId}?shop=${testShop}`).send(updateRuleDto).expect(404);
    });
  });

  describe('DELETE /rules/:id', () => {
    let createdRuleId: string;

    beforeEach(async () => {
      const createRuleDto = {
        shop: testShop,
        name: 'Test Delete Rule',
        type: RuleType.PRODUCT,
        isActive: true,
        minQty: 1,
        maxQty: 10,
        notifyAboutLimitWhen: NotificationTrigger.NO_NOTIFICATION,
        showContactUsInNotification: false,
        minQtyLimitMessage: 'Minimum quantity is {minQty}',
        maxQtyLimitMessage: 'Maximum quantity is {maxQty}',
        contactUsButtonText: 'Contact Us',
        contactUsMessage: 'Please contact us for assistance',
        ruleProduct: {
          conditionType: ProductSelectionType.ALL_PRODUCTS,
        },
      };

      const response = await request(app.getHttpServer()).post('/rules').send(createRuleDto).expect(201);
      createdRuleId = response.body.data.id;
    });

    it('should delete rule', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/rules/${createdRuleId}?shop=${testShop}`)
        .expect(200);

      expect(response.body.code).toBe(200);
      expect(response.body.message).toBe('Rule deleted successfully');

      await request(app.getHttpServer()).get(`/rules/${createdRuleId}?shop=${testShop}`).expect(404);
    });

    it('should return 404 for non-existent rule', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      await request(app.getHttpServer()).delete(`/rules/${fakeId}?shop=${testShop}`).expect(404);
    });
  });

  describe('POST /rules/seed', () => {
    it('should seed rules for all types', async () => {
      const seedRulesDto = {
        shop: testShop,
        count: 2,
      };

      const response = await request(app.getHttpServer()).post('/rules/seed').send(seedRulesDto).expect(201);

      expect(response.body.code).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.totalCreated).toBe(8);
      expect(response.body.data.rulesCreated).toBeDefined();
      expect(response.body.data.rulesCreated.length).toBe(8);

      const getResponse = await request(app.getHttpServer())
        .get(`/rules?shop=${testShop}&type=${RuleType.PRODUCT}`)
        .expect(200);

      const productRules = getResponse.body.data.filter((rule: Rule) => rule.name.includes('PRODUCT Rule'));
      expect(productRules.length).toBeGreaterThanOrEqual(2);
    });

    it('should validate count parameter', async () => {
      const seedRulesDto = {
        shop: testShop,
        count: 0,
      };

      await request(app.getHttpServer()).post('/rules/seed').send(seedRulesDto).expect(400);
    });
  });
});
