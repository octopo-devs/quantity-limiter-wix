import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-custom';
import * as CryptoJS from 'crypto-js';
import { safeJsonParseObject } from 'src/shared/common/utils/functions';

@Injectable()
export class HeaderStrategy extends PassportStrategy(Strategy, 'header') {
  async validate(request: Request) {
    Object.defineProperty(request, 'query', {
      value: {
        ...request.query,
      },
      writable: true,
      configurable: true,
    });
    if (!request.body) request.body = {};
    const urlParams: string = request.headers['authorization'];
    const objectUrlParams = safeJsonParseObject(urlParams);
    if (!urlParams) throw new UnauthorizedException('urlParams is required');
    if (
      urlParams === process.env.INTERNAL_SECRET_KEY ||
      (objectUrlParams?.api_key === process.env.INTERNAL_API_KEY &&
        objectUrlParams?.scope === process.env.INTERNAL_API_SCOPE)
    ) {
      return {
        isInternalAccess: true,
      };
    }

    const [sign, data] = urlParams.split('.');
    if (!sign || !data) return false;
    const signature = Buffer.from(sign.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('binary');
    const hmac = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, process.env.APP_SECRET);
    hmac.update(data);
    const hash = Buffer.from(
      hmac.finalize().toString(CryptoJS.enc.Base64).replace(/-/g, '+').replace(/_/g, '/'),
      'base64',
    ).toString('binary');
    if (hash === signature) {
      const buff = Buffer.from(data, 'base64');
      const text = buff.toString('ascii');
      const parseData = JSON.parse(text) as { [key: string]: any };
      if (['GET', 'DELETE'].includes(request.method)) request.query.shop = parseData.instanceId;
      else request.body.shop = parseData.instanceId;
      return parseData;
    }
    throw new UnauthorizedException();
  }
}
