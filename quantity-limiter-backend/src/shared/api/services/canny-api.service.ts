import { Injectable } from '@nestjs/common';
import Axios, { AxiosInstance } from 'axios';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class CannyApiService {
  private readonly cannyAxios: AxiosInstance;
  constructor() {
    this.cannyAxios = Axios.create({ baseURL: 'https://canny.io/api/v1' });
  }

  generateSSOTokenCanny(userData: { email: string; id: string; name: string }): string {
    return jwt.sign(userData, process.env.CANNY_API_KEY, {
      algorithm: 'HS256',
    });
  }

  async upsertCannyUser(shop: string): Promise<{ id: string }> {
    try {
      const cannyResponse = await this.cannyAxios.post('/users/find_or_create', {
        apiKey: process.env.CANNY_API_KEY,
        name: shop,
        userID: shop,
      });
      console.log(cannyResponse.data);
      return { id: cannyResponse.data.id };
    } catch (err) {
      console.log(err);
    }
  }
}
