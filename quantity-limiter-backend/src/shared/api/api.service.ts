import { Injectable } from '@nestjs/common';
import Axios, { AxiosHeaders, AxiosInstance, AxiosResponse, Method, RawAxiosRequestHeaders } from 'axios';
import { IApiPayload } from './types/api.interface';

@Injectable()
export class ApiService {
  private readonly axiosService: AxiosInstance;
  constructor() {
    this.axiosService = Axios.create({ timeout: 5000 });
  }

  async callAxiosService(
    method: Method,
    url: string,
    payload?: IApiPayload,
    headers?: AxiosHeaders | RawAxiosRequestHeaders,
  ) {
    const { params, ...data } = payload || {};
    if (!url) throw new Error(`Url not found`);
    try {
      let result: AxiosResponse;
      if (['GET', 'DELETE'].includes(method)) result = await this.axiosService({ method, url, params, headers });
      if (['POST', 'PUT'].includes(method)) result = await this.axiosService({ method, url, params, data, headers });
      return result.data;
    } catch (err) {
      const message = err?.response?.data?.name || err?.response?.data?.message || err.message;
      throw new Error(message);
    }
  }
}
