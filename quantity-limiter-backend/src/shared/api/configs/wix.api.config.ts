export const WIX_CONFIG = {
  API_URL: 'https://www.wixapis.com',
  REDIRECT_URL: 'https://www.wix.com/installer/install',
  EVENT_URL: 'https://www.wixapis.com/apps/v1/bi-event',
};

export const WIX_API = {
  GET: {
    APP_INSTANCE: '/apps/v1/instance',
    SHOP_DETAIL: '/site-properties/v4/properties',
    ORDER_DETAIL: '/stores/v2/orders',
    CHECKOUT_HISTORY: '/apps/v1/checkout/history',
    SCRIPT: '/apps/v1/scripts',
    PRICING: '/apps-plans/v1/apps-plans/',
    GET_APP_INSTANCE: '/apps/v1/instance',
    TOKEN_INFO: '/oauth2/token-info',
    PRODUCT_V1: '/stores-reader/v1/products/',
    COLLECTION_V1: '/stores-reader/v1/collections/',
    PUBLIC_PRICING_PLAN: '/apps-plans/v1/apps-plans/',
    CURRENT_CART: '/ecom/v1/carts/current',
    CART_BY_ID: '/ecom/v1/carts/',
  },
  POST: {
    TOKEN: '/oauth/access',
    SEARCH_ORDERS: '/stores/v2/orders/query',
    CREATE_SCRIPT: '/apps/v1/scripts',
    CREATE_CHARGE_URL: '/apps/v1/checkout',
    OAUTH: '/oauth2/token',
    PRODUCTS_V1: '/stores-reader/v1/products/query',
    COLLECTIONS_V1: '/stores-reader/v1/collections/query',
    CURRENT_CART: '/ecom/v1/carts/current/estimate-totals',
  },
  PUT: {},
  DELETE: {},
};

export type WIX_API_METHOD = keyof typeof WIX_API;

export type WIX_API_SERVICE<M extends WIX_API_METHOD> = keyof (typeof WIX_API)[M];
