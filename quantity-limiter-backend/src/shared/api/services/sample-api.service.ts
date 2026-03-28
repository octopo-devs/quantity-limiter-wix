import { Injectable } from '@nestjs/common';
import Axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  SAMPLE_API,
  SAMPLE_API_METHOD,
  SAMPLE_API_SERVICE,
  SAMPLE_CONFIG,
} from '../types/sample-api/sample-api.constant';
import { IApiAuth, IApiPayload } from '../types/api.interface';

@Injectable()
export class SampleApiService {
  private readonly sampleAxios: AxiosInstance;
  constructor() {
    this.sampleAxios = Axios.create({ baseURL: SAMPLE_CONFIG.API_URL });
  }

  async callSampleServices<M extends SAMPLE_API_METHOD>(
    method: M,
    service: SAMPLE_API_SERVICE<M>,
    payload: IApiPayload,
    auth: IApiAuth,
  ) {
    const { params, replacePath, data } = payload;
    const { accessToken } = auth;
    let url = SAMPLE_API[String(method)][service];
    if (!url) throw new Error(`Service ${String(service)} not found`);
    if (replacePath) {
      Object.keys(replacePath).forEach((key) => {
        if (!url.includes(`:${key}`)) return;
        url = url.replace(`:${key}`, replacePath[key]);
      });
    }
    try {
      let result: AxiosResponse;
      if (['GET', 'DELETE'].includes(method)) {
        result = await this.sampleAxios({ method, url, params, headers: { Authorization: accessToken } });
      } else if (['POST', 'PUT'].includes(method)) {
        result = await this.sampleAxios({ method, url, params, data, headers: { Authorization: accessToken } });
      }
      return result.data;
    } catch (err) {
      const message = err?.response?.data || err?.response?.data?.message || err.message;
      throw new Error(message);
    }
  }
}
