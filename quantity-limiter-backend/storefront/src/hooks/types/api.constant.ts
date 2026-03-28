export const APP_API = {
  GET: {
    GET_CART_TRACKING_LOG: '/tracking/cart',
    GET_SHOP_METAFIELDS: '/public-endpoint/shop-metafield',
    GET_VARIANT_INVENTORY: '/public-endpoint/inventory',
    GET_PRODUCT_METAFIELD: '/public-endpoint/productMetafield',
    GET_VARIANT_METAFIELD: '/public-endpoint/variantMetafield',
    GET_CURRENT_PRODUCT_INFO: '/public-endpoint/currentProduct',
    GET_CURRENT_CART_INFO: '/public-endpoint/currentCart',
  },
  POST: {
    SAVE_TRACKING_LOG: '/tracking/log',
    SAVE_RULE_LOG: '/analytics/analytic/rule',
  },
};

export type APP_API_METHOD = keyof typeof APP_API;

export type APP_API_SERVICE<M extends APP_API_METHOD> = keyof (typeof APP_API)[M];

export const ADMIN_API = {
  GET: {
    GET_IP_LOCATION: `https://apps.synctrack.ioo/admin-tracking-paypal/api/location/ip-location`,
    GET_LOCATION_OPTIONS: `https://apps.synctrack.ioo/admin-tracking-paypal/api/location/country/search`,
  },
};

export type ADMIN_API_METHOD = keyof typeof ADMIN_API;

export type ADMIN_API_SERVICE<M extends ADMIN_API_METHOD> = keyof (typeof ADMIN_API)[M];
