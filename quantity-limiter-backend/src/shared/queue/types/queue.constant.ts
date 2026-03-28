import { JobOptions } from 'bull';

export const QUEUE_PREFIX: string = 'order-limiter';

export const QUEUE_OPTIONS: JobOptions = {
  attempts: 5,
  removeOnComplete: 100,
  backoff: 10 * 60 * 1000,
};
