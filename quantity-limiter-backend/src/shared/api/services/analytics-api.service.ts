import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Axios, { AxiosInstance } from 'axios';
import { randomBytes } from 'crypto';
import { Repository } from 'typeorm';
import { ShopInfo } from 'src/modules/shop/entities/shop-info.entity';
import { Ga4Event } from '../types/analytics-api/analytics-api.enum';
import { IWixShopData } from 'src/modules/wix/types/wix.interface';
import { IGa4EventPayload } from '../types/analytics-api/analytics-api.interface';

@Injectable()
export class AnalyticApiService {
  private readonly ga4Axios: AxiosInstance;
  constructor(
    @InjectRepository(ShopInfo)
    private readonly shopInfoRepository: Repository<ShopInfo>,
  ) {
    this.ga4Axios = Axios.create({
      baseURL: 'https://www.google-analytics.com/mp/collect',
      params: {
        measurement_id: process.env.GA_MEASUREMENT_ID,
        api_secret: process.env.GA_API_SECRET,
      },
      timeout: 5 * 1000,
    });
  }

  generateUniqueId = () => {
    // Generates a buffer of 16 bytes (128 bits) of random data.
    const buffer = randomBytes(16);
    // Convert the buffer to a hex string which will be 32 characters long.
    const uniqueId = buffer.toString('hex');
    return uniqueId;
  };

  async sendEventGa4(eventName: Ga4Event, parameters: IGa4EventPayload): Promise<void> {
    const clientId = this.generateUniqueId();
    const shop = parameters.shop_name;
    const shopInfo = await this.shopInfoRepository.findOne({ where: { shop } });
    if (!shopInfo) return;
    const shopData: IWixShopData = JSON.parse(shopInfo.shopJson);
    parameters.shop_id = shopData.id;
    parameters.app_name = 'order-limiter-shipping-date';
    const payload = {
      client_id: clientId, // A unique identifier for a user, session, or device
      events: [
        {
          name: eventName,
          params: parameters,
        },
      ],
    };
    if (process.env.NODE_ENV === 'production') {
      try {
        const response = await this.ga4Axios({ method: 'POST', data: payload });
        console.log('Event sent to GA4:', response.status);
        return response.data;
      } catch (error) {
        console.error('Error sending event to GA4:', error);
      }
    }
  }
}
