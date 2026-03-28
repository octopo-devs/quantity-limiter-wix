import { getQueueToken } from '@nestjs/bull';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AwsApiService } from 'src/shared/api/services/aws-api.service';
import { CannyApiService } from 'src/shared/api/services/canny-api.service';
import { QueueProcessor } from 'src/shared/queue/types/queue.enum';
import { Repository } from 'typeorm';
import { ShopCheckoutAppearanceSettings } from '../entities/shop-checkout-appearance.entity';
import { ShopEmailConsent } from '../entities/shop-email-consent.entity';
import { ShopGeneral } from '../entities/shop-general.entity';
import { ShopInfo } from '../entities/shop-info.entity';
import { ShopInstalled } from '../entities/shop-installed.entity';
import { ShopService } from '../shop.service';

describe('ShopService', function () {
  let shopService: ShopService;
  const SHOP_GENERAL_TOKEN = getRepositoryToken(ShopGeneral);
  const SHOP_INFO_TOKEN = getRepositoryToken(ShopInfo);
  const SHOP_INSTALLED_TOKEN = getRepositoryToken(ShopInstalled);
  const SHOP_EMAIL_CONSENT_TOKEN = getRepositoryToken(ShopEmailConsent);
  const SHOP_CHECKOUT_APPEARANCE_SETTINGS_TOKEN = getRepositoryToken(ShopCheckoutAppearanceSettings);

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        ShopService,
        AwsApiService,
        EventEmitter2,
        CannyApiService,
        {
          provide: SHOP_GENERAL_TOKEN,
          useClass: Repository,
        },
        {
          provide: SHOP_INFO_TOKEN,
          useClass: Repository,
        },
        {
          provide: SHOP_INSTALLED_TOKEN,
          useClass: Repository,
        },
        {
          provide: SHOP_EMAIL_CONSENT_TOKEN,
          useClass: Repository,
        },
        {
          provide: SHOP_CHECKOUT_APPEARANCE_SETTINGS_TOKEN,
          useClass: Repository,
        },
        {
          provide: getQueueToken(QueueProcessor.CustomerIO),
          useValue: { add: jest.fn() },
        },
      ],
    }).compile();
    shopService = moduleRef.get<ShopService>(ShopService);
  });

  it('should be defined', () => {
    expect(shopService).toBeDefined();
  });
});
