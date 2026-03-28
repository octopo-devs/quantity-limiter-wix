export const SAMPLE_CONFIG = {
  API_URL: 'https://www.sample.com',
};

export const SAMPLE_API = {
  GET: {
    SAMPLE_GET: '/sample',
  },
  POST: {
    SAMPLE_POST: '/sample',
  },
  PUT: {
    SAMPLE_PUT: '/sample',
  },
  DELETE: {
    SAMPLE_DELETE: '/sample',
  },
};

export type SAMPLE_API_METHOD = keyof typeof SAMPLE_API;

export type SAMPLE_API_SERVICE<M extends SAMPLE_API_METHOD> = keyof (typeof SAMPLE_API)[M];
