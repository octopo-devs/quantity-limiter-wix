import { Test } from '@nestjs/testing';
import * as CryptoJS from 'crypto-js';
import { UnauthorizedException } from '@nestjs/common';
import { HeaderStrategy } from './header.strategy';

const APP_SECRET = 'test-app-secret-key';

function createValidInstanceToken(data: object, secret: string): string {
  const dataStr = Buffer.from(JSON.stringify(data)).toString('base64');
  const hmac = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, secret);
  hmac.update(dataStr);
  const sign = hmac
    .finalize()
    .toString(CryptoJS.enc.Base64)
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  return `${sign}.${dataStr}`;
}

describe('HeaderStrategy', () => {
  let headerStrategy: HeaderStrategy;

  beforeEach(async () => {
    process.env.APP_SECRET = APP_SECRET;
    // Set internal keys to known non-matching values to prevent false positive matches
    // (if both INTERNAL_API_KEY and INTERNAL_API_SCOPE are undefined, {} matches them)
    process.env.INTERNAL_SECRET_KEY = '__unset__';
    process.env.INTERNAL_API_KEY = '__unset_api_key__';
    process.env.INTERNAL_API_SCOPE = '__unset_api_scope__';

    const moduleRef = await Test.createTestingModule({
      providers: [HeaderStrategy],
    }).compile();

    headerStrategy = moduleRef.get<HeaderStrategy>(HeaderStrategy);
  });

  afterEach(() => {
    delete process.env.APP_SECRET;
    delete process.env.INTERNAL_SECRET_KEY;
    delete process.env.INTERNAL_API_KEY;
    delete process.env.INTERNAL_API_SCOPE;
  });

  // Helper: build a request object suitable for the strategy
  function buildRequest(authorization: string, method = 'GET'): any {
    return {
      headers: { authorization },
      body: {},
      query: {},
      method,
    };
  }

  it('should be defined', () => {
    expect(headerStrategy).toBeDefined();
  });

  it('should throw UnauthorizedException when Authorization header is missing', async () => {
    const mockRequest = {
      headers: {},
      body: {},
      query: {},
      method: 'GET',
    } as any;

    await expect(headerStrategy.validate(mockRequest)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException when HMAC signature is tampered', async () => {
    // Build a token signed with a different secret — signature mismatch
    const token = createValidInstanceToken({ instanceId: 'shop-123' }, 'wrong-secret');
    const mockRequest = {
      headers: { authorization: token },
      body: {},
      query: {},
      method: 'GET',
    } as any;

    await expect(headerStrategy.validate(mockRequest)).rejects.toThrow(UnauthorizedException);
  });

  it('should return false when token has no dot separator', async () => {
    // Use a token that is not the internal secret key and has no dot
    const mockRequest = {
      headers: { authorization: 'nodottoken' },
      body: {},
      query: {},
      method: 'GET',
    } as any;

    const result = await headerStrategy.validate(mockRequest);
    expect(result).toBe(false);
  });

  it('should accept valid HMAC-signed token and inject shop into request.query for GET', async () => {
    const token = createValidInstanceToken({ instanceId: 'shop-123' }, APP_SECRET);
    // We use a plain object and let the strategy set query.shop on it
    const query: Record<string, any> = {};
    const mockRequest = {
      headers: { authorization: token },
      body: {},
      get query() {
        return query;
      },
      set query(v: any) {
        Object.assign(query, v);
      },
      method: 'GET',
    } as any;

    const result = await headerStrategy.validate(mockRequest);

    expect(result).toBeTruthy();
    // The strategy sets shop on request.query inside Object.defineProperty
    // We check mockRequest.query.shop via the object reference
    expect(mockRequest.query.shop).toBe('shop-123');
  });

  it('should inject shop into request.body for POST method', async () => {
    const token = createValidInstanceToken({ instanceId: 'shop-456' }, APP_SECRET);
    const body: Record<string, any> = {};
    const mockRequest = {
      headers: { authorization: token },
      body,
      query: {},
      method: 'POST',
    } as any;

    await headerStrategy.validate(mockRequest);

    expect(mockRequest.body.shop).toBe('shop-456');
  });

  it('should allow internal access when Authorization matches INTERNAL_SECRET_KEY', async () => {
    const internalKey = 'unique-internal-secret-xyz';
    process.env.INTERNAL_SECRET_KEY = internalKey;

    const mockRequest = {
      headers: { authorization: internalKey },
      body: {},
      query: {},
      method: 'GET',
    } as any;

    const result = await headerStrategy.validate(mockRequest);

    expect(result).toEqual({ isInternalAccess: true });
  });
});
