import { InternalServerErrorException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AnalyticApiService } from 'src/shared/api/services/analytics-api.service';
import { WixApiService } from 'src/shared/api/services/wix-api.service';
import { ShopInfo } from 'src/modules/shop/entities/shop-info.entity';
import { Repository } from 'typeorm';
import { ShopService } from '../shop/shop.service';
import { WixService } from './wix.service';

describe('WixService', () => {
  let wixService: WixService;
  let wixApiService: jest.Mocked<WixApiService>;
  let shopService: jest.Mocked<ShopService>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  const mockWixApiService = {
    getWixAccessToken: jest.fn(),
    callWixServices: jest.fn(),
    confirmInstalled: jest.fn(),
    handleAccessTokenFromRedis: jest.fn(),
  };

  const mockShopService = {
    findOneShopInfo: jest.fn(),
    findOneShopInstalled: jest.fn(),
    updateShopInstall: jest.fn(),
    updateShopGeneral: jest.fn(),
  };

  const mockEventEmitter = {
    emitAsync: jest.fn(),
    emit: jest.fn(),
  };

  const mockAnalyticApiService = {
    trackInstall: jest.fn(),
    sendEvent: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        WixService,
        { provide: WixApiService, useValue: mockWixApiService },
        { provide: ShopService, useValue: mockShopService },
        { provide: EventEmitter2, useValue: mockEventEmitter },
        { provide: AnalyticApiService, useValue: mockAnalyticApiService },
        {
          provide: getRepositoryToken(ShopInfo),
          useClass: Repository,
        },
      ],
    }).compile();

    wixService = moduleRef.get<WixService>(WixService);
    wixApiService = moduleRef.get(WixApiService);
    shopService = moduleRef.get(ShopService);
    eventEmitter = moduleRef.get(EventEmitter2);
  });

  it('should be defined', () => {
    expect(wixService).toBeDefined();
  });

  it('should call confirmInstalled after successful emitAsync', async () => {
    const wixPayload = {
      instanceId: 'shop-123',
      code: 'auth-code',
    } as any;

    mockShopService.findOneShopInfo.mockResolvedValueOnce(null); // Initial check — no existing shop
    mockWixApiService.getWixAccessToken.mockResolvedValue({
      refresh_token: 'rt',
      access_token: 'at',
    });
    mockWixApiService.callWixServices.mockResolvedValue({
      instance: null,
    });
    mockEventEmitter.emitAsync.mockResolvedValue([]);
    // After emitAsync, findOneShopInfo returns the shop with refreshToken persisted
    mockShopService.findOneShopInfo.mockResolvedValueOnce({
      shop: 'shop-123',
      refreshToken: 'rt',
    });
    mockWixApiService.confirmInstalled.mockResolvedValue(undefined);
    mockWixApiService.callWixServices.mockResolvedValue({});

    await wixService.handleGetTokenAndRedirect(wixPayload);

    expect(mockWixApiService.confirmInstalled).toHaveBeenCalledWith('at');
  });

  it('should throw InternalServerErrorException when refreshToken not persisted after emitAsync', async () => {
    const wixPayload = {
      instanceId: 'shop-999',
      code: 'auth-code-bad',
    } as any;

    mockShopService.findOneShopInfo.mockResolvedValueOnce(null); // Initial check — no existing shop
    mockWixApiService.getWixAccessToken.mockResolvedValue({
      refresh_token: 'rt',
      access_token: 'at',
    });
    mockWixApiService.callWixServices.mockResolvedValue({
      instance: null,
    });
    mockEventEmitter.emitAsync.mockResolvedValue([]);
    // After emitAsync, findOneShopInfo returns null — refresh token NOT persisted
    mockShopService.findOneShopInfo.mockResolvedValueOnce(null);

    await expect(wixService.handleGetTokenAndRedirect(wixPayload)).rejects.toThrow(
      InternalServerErrorException,
    );
    expect(mockWixApiService.confirmInstalled).not.toHaveBeenCalled();
  });

  it('should handle reinstall by clearing closeStore flag', async () => {
    const wixPayload = {
      instanceId: 'shop-reinstall',
      code: 'auth-code-reinstall',
    } as any;

    // Initial check — existing shop found
    mockShopService.findOneShopInfo.mockResolvedValueOnce({
      shop: 'shop-reinstall',
      shopJson: null,
    });
    mockShopService.findOneShopInstalled.mockResolvedValue({
      shop: 'shop-reinstall',
      closeStore: true,
    });
    mockShopService.updateShopInstall.mockResolvedValue(undefined);
    mockWixApiService.getWixAccessToken.mockResolvedValue({
      refresh_token: 'rt',
      access_token: 'at',
    });
    mockWixApiService.callWixServices.mockResolvedValue({ instance: null });
    mockEventEmitter.emitAsync.mockResolvedValue([]);
    // After emitAsync, findOneShopInfo returns shop with refreshToken
    mockShopService.findOneShopInfo.mockResolvedValueOnce({
      shop: 'shop-reinstall',
      refreshToken: 'rt',
    });
    mockWixApiService.confirmInstalled.mockResolvedValue(undefined);

    await wixService.handleGetTokenAndRedirect(wixPayload);

    expect(mockShopService.updateShopInstall).toHaveBeenCalledWith(
      { shop: 'shop-reinstall' },
      { closeStore: false, dateUninstalled: null, uninstalled: false },
    );
  });
});
