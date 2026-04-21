// Test-only stub for @/config. The real module uses `import.meta.env` which
// ts-jest cannot parse (CommonJS). Jest's moduleNameMapper rewrites `@/config`
// imports to this stub in the test environment.
export const TRULY_VALUES = ['1', 1, true, 'true', 'yes', 'y'];
export const IS_TRULY = (value: any) =>
  ['string', 'number', 'boolean'].includes(typeof value) && TRULY_VALUES.includes(value);

export const config = {
  shop: 'test-shop',
  urlParams: '',
  embedded: false,
  hmac: null,
  host: null,
  source: null,
  token: null,
  locale: null,
  session: null,
  role: null,
  instance: null,
};

export const SHOW_MULTIPLES_FEATURE = false;

export const WixClient: any = {};
