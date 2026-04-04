import { QuantityLimitResult, QuantityLimitRule } from '~/shared/types/quantity-limit.types';

export interface IQuantityLimitContext {
  rules: QuantityLimitRule[];
  results: Record<string, QuantityLimitResult>;
  hasViolation: boolean;
}
