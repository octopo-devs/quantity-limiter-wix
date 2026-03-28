import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as rawbody from 'raw-body';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async verifyWebhook(req) {
    const raw = await rawbody(req);
    const token = raw.toString().trim();
    const rawPublicKey = process.env.PUBLIC_KEY || '';

    try {
      const publicKey = Buffer.from(rawPublicKey, 'base64').toString('utf8');
      const dataDecoded = await this.jwtService.verifyAsync(token, { publicKey, algorithms: ['RS256'] });
      return dataDecoded;
    } catch (error) {
      console.log('error', error);
      return false;
    }
  }
}
