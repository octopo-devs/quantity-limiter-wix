export const SHOPIFY_REST_SERVICES = {
  GET: {
    GET_APP_CHARGES: `/admin/api/:version/recurring_application_charges.json`,
    GET_WEBHOOKS: `/admin/api/:version/webhooks.json`,
    GET_THEMES: `/admin/api/:version/themes.json`,
    GET_ASSET: `/admin/api/:version/themes/:theme_id/assets.json?asset[key]=:asset_key`,
    GET_METAFIELDS: '/admin/api/:version/metafields.json',
    GET_SHIPPING_ZONES: '/admin/api/:version/shipping_zones.json',
    DETAIL_SHOP: `/admin/api/:version/shop.json`,
    DETAIL_APP_CHARGE: `/admin/api/:version/recurring_application_charges/:chargeId.json`,
  },
  POST: {
    CREATE_ACCESS_TOKEN: `/admin/oauth/access_token`,
    CREATE_WEBHOOK_SUBSCRIPTION: `/admin/api/:version/webhooks.json`,
    CREATE_APP_CHARGE: `/admin/api/:version/recurring_application_charges.json`,
    GRAPHQL: `/admin/api/:version/graphql.json`,
  },
  PUT: {
    UPDATE_WEBHOOK: `/admin/api/:version/webhooks/:webhookId.json`,
  },
  DELETE: {
    REMOVE_WEBHOOK: `/admin/api/:version/webhooks/:webhookId.json`,
    REMOVE_APP_CHARGE: `/admin/api/:version/recurring_application_charges/:chargeId.json`,
  },
};

export type SHOPIFY_API_METHOD = keyof typeof SHOPIFY_REST_SERVICES;

export type SHOPIFY_API_SERVICE<M extends SHOPIFY_API_METHOD> = keyof (typeof SHOPIFY_REST_SERVICES)[M];
