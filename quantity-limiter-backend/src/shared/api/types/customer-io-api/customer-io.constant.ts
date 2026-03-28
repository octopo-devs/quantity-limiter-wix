export const CUSTOMER_IO_CONFIG = {
  BASE_URL: 'https://track.customer.io/api',
  APP_URL: 'https://api.customer.io',
};

export const CUSTOMER_IO_API = {
  POST: {
    TRACK_CUSTOMER_EVENT: '/v1/customers/:email/events',
  },
  PUT: {
    REGISTER_CUSTOMER: '/v1/customers/:email',
    UPDATE_CUSTOMER: '/v1/customers/:id',
  },
  DELETE: {
    REMOVE_CUSTOMER: '/v1/customers/:email',
  },
  GET: {
    INFO_CUSTOMER: '/v1/customers',
    APP_GET_CUSTOMERS: '/v1/customers',
  },
};

export type CIO_API_METHOD = keyof typeof CUSTOMER_IO_API;

export type CIO_API_SERVICE<M extends CIO_API_METHOD> = keyof (typeof CUSTOMER_IO_API)[M];
