import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { WixApiService } from 'src/shared/api/services/wix-api.service';
import { Repository } from 'typeorm';
import { ShopInfo } from 'src/modules/shop/entities/shop-info.entity';
import { ShopInstalled } from 'src/modules/shop/entities/shop-installed.entity';
import { CollectionProduct } from './entities/collection/collection-product.entity';
import { Collection } from './entities/collection/collection.entity';
import { AttributeCron } from './entities/attribute-cron.entity';
import { ProductSKU } from './entities/product/product-sku.entity';
import { ProductVariant } from './entities/product/product-variant.entity';
import { Product } from './entities/product/product.entity';
import { CronAttributeStatus } from './types/attributes.enum';
import { AttributesService } from './attributes.service';

describe('AttributesService', () => {
  let attributesService: AttributesService;

  const mockAttributeCronRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockWixApiService = {
    callWixServices: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        AttributesService,
        { provide: WixApiService, useValue: mockWixApiService },
        {
          provide: getRepositoryToken(AttributeCron),
          useValue: mockAttributeCronRepository,
        },
        {
          provide: getRepositoryToken(Product),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(ProductVariant),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(ProductSKU),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Collection),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(ShopInfo),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(ShopInstalled),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(CollectionProduct),
          useClass: Repository,
        },
      ],
    }).compile();

    attributesService = moduleRef.get<AttributesService>(AttributesService);
  });

  it('should be defined', () => {
    expect(attributesService).toBeDefined();
  });

  it('should create a Pending cron record on AppInstall event', async () => {
    const payload = {
      shop: 'shop-123',
      refreshToken: 'rt',
      appInstance: {},
      siteData: {},
    } as any;

    mockAttributeCronRepository.findOne.mockResolvedValue(null);
    const createdCron = { shop: 'shop-123', status: CronAttributeStatus.Pending, retry: 0 };
    mockAttributeCronRepository.create.mockReturnValue(createdCron);
    mockAttributeCronRepository.save.mockResolvedValue(createdCron);

    await attributesService.createAttributeCronInstallApp(payload);

    expect(mockAttributeCronRepository.create).toHaveBeenCalledWith({
      shop: 'shop-123',
      status: CronAttributeStatus.Pending,
      retry: 0,
      id: undefined,
    });
    expect(mockAttributeCronRepository.save).toHaveBeenCalledWith(createdCron);
  });

  it('should reuse existing cron record id if one exists', async () => {
    const payload = {
      shop: 'shop-123',
      refreshToken: 'rt',
      appInstance: {},
      siteData: {},
    } as any;

    const existingCron = { id: 42, shop: 'shop-123', status: CronAttributeStatus.Completed };
    mockAttributeCronRepository.findOne.mockResolvedValue(existingCron);
    const createdCron = { id: 42, shop: 'shop-123', status: CronAttributeStatus.Pending, retry: 0 };
    mockAttributeCronRepository.create.mockReturnValue(createdCron);
    mockAttributeCronRepository.save.mockResolvedValue(createdCron);

    await attributesService.createAttributeCronInstallApp(payload);

    expect(mockAttributeCronRepository.create).toHaveBeenCalledWith({
      shop: 'shop-123',
      status: CronAttributeStatus.Pending,
      retry: 0,
      id: 42,
    });
  });

  it('should do nothing if shop is empty', async () => {
    const payload = {
      shop: '',
      refreshToken: 'rt',
      appInstance: {},
      siteData: {},
    } as any;

    await attributesService.createAttributeCronInstallApp(payload);

    expect(mockAttributeCronRepository.save).not.toHaveBeenCalled();
  });
});
