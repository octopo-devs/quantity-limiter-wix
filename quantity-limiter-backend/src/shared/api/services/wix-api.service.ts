import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import Axios, { AxiosInstance } from 'axios';
import { WIX_API, WIX_API_METHOD, WIX_API_SERVICE, WIX_CONFIG } from '../configs/wix.api.config';
import {
  IApiPayload,
  IGetAccessTokenPayload,
  IGetAccessTokenResponse,
  IGetOAuthAccessTokenPayload,
} from '../types/wix-api/wix-api.interface';
import * as rawbody from 'raw-body';
import { JwtService } from '@nestjs/jwt';
import { CustomCacheService } from 'src/shared/custom-cache/custom-cache.service';

@Injectable()
export class WixApiService {
  private readonly axios: AxiosInstance;
  private readonly wixAxios: AxiosInstance;
  private readonly wixEventAxios: AxiosInstance;

  constructor(
    private readonly jwtService: JwtService,
    private readonly customCacheService: CustomCacheService,
  ) {
    this.axios = Axios.create();
    this.wixAxios = Axios.create({ baseURL: WIX_CONFIG.API_URL });
    this.wixEventAxios = Axios.create({ baseURL: WIX_CONFIG.EVENT_URL });
  }

  async getWixAccessToken(
    grantType: 'authorization_code' | 'refresh_token',
    code: string,
  ): Promise<IGetAccessTokenResponse> {
    const payload: IGetAccessTokenPayload = {
      client_id: process.env.APP_ID,
      client_secret: process.env.APP_SECRET,
      grant_type: grantType,
    };
    if (grantType === 'authorization_code') payload.code = code;
    else payload.refresh_token = code;

    try {
      const result = await this.wixAxios.post(WIX_API.POST.TOKEN, payload);
      return result.data;
    } catch (err) {
      throw new BadRequestException(err?.response?.data?.payload?.message || err.message);
    }
  }

  async getWixOAuthAccessToken(instanceId: string): Promise<IGetAccessTokenResponse> {
    const payload: IGetOAuthAccessTokenPayload = {
      client_id: process.env.APP_ID,
      client_secret: process.env.APP_SECRET,
      grant_type: 'client_credentials',
      instance_id: instanceId,
    };

    try {
      const result = await this.wixAxios.post(WIX_API.POST.OAUTH, payload);

      this.handleAccessTokenFromRedis(instanceId, result.data?.access_token);
      return result.data;
    } catch (err) {
      throw new BadRequestException(err?.response?.data?.payload?.message || err.message);
    }
  }

  async handleAccessTokenFromRedis(instanceId: string, accessToken?: string): Promise<string> {
    const TWO_HOURS = 14400000;

    if (accessToken) {
      await this.customCacheService.set(instanceId, accessToken, TWO_HOURS - 10000);
      return accessToken;
    } else {
      const token: string = await this.customCacheService.get(instanceId);
      return token;
    }
  }

  async callWixServices<M extends WIX_API_METHOD>(
    method: M,
    service: WIX_API_SERVICE<M>,
    payload: IApiPayload,
    instanceId: string,
  ) {
    const { param, ...data } = payload;
    let accessToken = await this.handleAccessTokenFromRedis(instanceId);
    if (!accessToken) {
      const dataAuth = await this.getWixOAuthAccessToken(instanceId);
      accessToken = dataAuth?.access_token;
    }
    let endpoint = WIX_API[String(method)][service];
    if (!endpoint) throw new InternalServerErrorException(`Service ${String(service)} not found`);
    if (param) endpoint += param;

    try {
      let result;
      if (method === 'GET') {
        result = await this.wixAxios.get(endpoint, {
          params: data,
          headers: { Authorization: accessToken },
        });
      } else if (method === 'POST' || method === 'PUT') {
        result = await this.wixAxios[method.toLowerCase()](endpoint, data, {
          headers: { Authorization: accessToken },
        });
      } else if (method === 'DELETE') {
        result = await this.wixAxios.delete(endpoint, {
          headers: { Authorization: accessToken },
        });
      }
      return result?.data || result?.status;
    } catch (err) {
      const message = err?.response?.data?.name || err?.response?.data?.message || err.message;
      throw new Error(message);
    }
  }

  async getProductByIdV1(shop: string, productId: string) {
    try {
      const res = await this.callWixServices('GET', 'PRODUCT_V1', { param: productId, includeVariants: true }, shop);
      return res?.product || {};
    } catch (error) {
      console.log(error);
      return {};
    }
  }

  async getCurrentCartInfoV1(shop: string) {
    try {
      const res = await this.callWixServices('GET', 'CURRENT_CART', {}, shop);
      return res?.cart || {};
    } catch (error) {
      console.log(error);
      return {};
    }
  }

  async getCollectionByIdV1(shop: string, collectionId: string) {
    try {
      const res = await this.callWixServices('GET', 'COLLECTION_V1', { param: collectionId }, shop);
      return res?.collection || {};
    } catch (error) {
      console.log(error);
      return {};
    }
  }

  async confirmInstalled(accessToken: string) {
    try {
      await this.wixEventAxios.post(
        '',
        { eventName: 'APP_FINISHED_CONFIGURATION' },
        {
          headers: { Authorization: accessToken },
        },
      );
    } catch (err) {
      console.log(err);
      throw new Error(err.message);
    }
  }

  async decodePayload(req) {
    const raw = await rawbody(req);
    const text = raw.toString().trim();
    const decode = this.jwtService.decode(text) as { [key: string]: any };
    const parsed = JSON.parse(decode.data);
    if (parsed.data) parsed.data = JSON.parse(parsed.data);
    return parsed;
  }

  async test() {
    const response = await this.axios.get('https://developer.paypal.com/docs/tracking/reference/carriers/');
    return response.data;
  }
}
