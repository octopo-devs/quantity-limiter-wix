import { Injectable } from '@nestjs/common';
import Axios, { AxiosInstance, AxiosResponse } from 'axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShopInfo } from 'src/modules/shop/entities/shop-info.entity';
import {
  CIO_API_METHOD,
  CIO_API_SERVICE,
  CUSTOMER_IO_API,
  CUSTOMER_IO_CONFIG,
} from '../types/customer-io-api/customer-io.constant';
import { ICustomerIoPayload } from '../types/customer-io-api/customer-io.interface';

@Injectable()
export class CustomerIoApiService {
  private readonly trackCustomerIoAxios: AxiosInstance;
  private readonly appCustomerIoAxios: AxiosInstance;

  constructor(
    @InjectRepository(ShopInfo)
    private readonly shopInfoRepository: Repository<ShopInfo>,
  ) {
    this.trackCustomerIoAxios = Axios.create({
      baseURL: CUSTOMER_IO_CONFIG.BASE_URL,
      auth: {
        username: process.env.CIO_SITE_ID,
        password: process.env.CIO_API_KEY,
      },
    });
    this.appCustomerIoAxios = Axios.create({
      baseURL: CUSTOMER_IO_CONFIG.APP_URL,
      headers: { Authorization: `Bearer ${process.env.CIO_APP_API_KEY}` },
    });
  }

  async getShopEmail(shop: string): Promise<string> {
    const shopInfo = await this.shopInfoRepository.findOne({ where: { shop } });
    if (!shopInfo) return;
    if (shopInfo.email) return shopInfo.email;
    try {
      const shopData = JSON.parse(shopInfo.shopJson);
      if (!shopData.email) return;
      return shopData.email;
    } catch (err) {
      return;
    }
  }

  async registerCustomerIo(email: string, shop: string, data: Record<string, any>) {
    email = email || (await this.getShopEmail(shop));
    if (!email) return;
    try {
      await this.callCustomerIoTrackServices('PUT', 'REGISTER_CUSTOMER', { data, replacePath: { email } });
    } catch (err) {
      console.log(err);
      throw new Error(err.message);
    }
  }

  async sendEventCustomerIo(email: string, shop: string, data: Record<string, any>) {
    email = email || (await this.getShopEmail(shop));
    if (!email) return;
    try {
      await this.callCustomerIoTrackServices('POST', 'TRACK_CUSTOMER_EVENT', { data, replacePath: { email } });
    } catch (err) {
      console.log(err);
      throw new Error(err.message);
    }
  }

  async callCustomerIoAppServices<M extends CIO_API_METHOD>(
    method: M,
    service: CIO_API_SERVICE<M>,
    payload: ICustomerIoPayload,
  ) {
    const { params, data, replacePath } = payload;
    let url = CUSTOMER_IO_API[String(method)][service];
    if (!url) throw new Error(`Service ${String(service)} not found`);
    if (replacePath) {
      Object.keys(replacePath).forEach((key) => {
        if (!url.includes(`:${key}`)) return;
        url = url.replace(`:${key}`, replacePath[key]);
      });
    }
    try {
      let result: AxiosResponse;
      if (['GET', 'DELETE'].includes(method)) result = await this.appCustomerIoAxios({ method, url, params });
      if (['POST', 'PUT'].includes(method)) result = await this.appCustomerIoAxios({ method, url, params, data });
      return result.data;
    } catch (err) {
      console.log(JSON.stringify(err.response.data));
      throw new Error(err.message);
    }
  }

  async callCustomerIoTrackServices<M extends CIO_API_METHOD>(
    method: M,
    service: CIO_API_SERVICE<M>,
    payload: ICustomerIoPayload,
  ) {
    const { params, data, replacePath } = payload;
    let url = CUSTOMER_IO_API[String(method)][service];
    if (!url) throw new Error(`Service ${String(service)} not found`);
    if (replacePath) {
      Object.keys(replacePath).forEach((key) => {
        if (!url.includes(`:${key}`)) return;
        url = url.replace(`:${key}`, replacePath[key]);
      });
    }
    try {
      let result: AxiosResponse;
      if (['GET', 'DELETE'].includes(method)) result = await this.trackCustomerIoAxios({ method, url, params });
      if (['POST', 'PUT'].includes(method)) result = await this.trackCustomerIoAxios({ method, url, params, data });
      return result.data;
    } catch (err) {
      console.log(JSON.stringify(err.response.data));
      throw new Error(err.message);
    }
  }
}
