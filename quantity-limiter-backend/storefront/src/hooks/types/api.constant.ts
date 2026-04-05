export const APP_API = {
  GET: {
    GET_SHOP_METAFIELDS: '/public-endpoint/shop-metafield',
    GET_CURRENT_PRODUCT_INFO: '/public-endpoint/currentProduct',
    GET_CURRENT_CART_INFO: '/public-endpoint/currentCart',
  },
  POST: {
    SAVE_RULE_LOG: '/analytics/analytic/rule',
  },
};

export type APP_API_METHOD = keyof typeof APP_API;

export type APP_API_SERVICE<M extends APP_API_METHOD> = keyof (typeof APP_API)[M];
