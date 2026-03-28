import { SortDirection } from '@/types/enum';
import { Appearance } from './appearance.interface';
import { Rule } from './rule.interface';

export interface DefaultPaginationRequest {
  page?: number;
  perPage?: number;
  sortDirection?: SortDirection;
}

export namespace ApiRequest {
  export type GetRulesQuery = DefaultPaginationRequest & Partial<Pick<Rule, 'name' | 'type' | 'isActive'>>;
  export type CreateRule = Omit<Rule, 'id' | 'createdAt' | 'updatedAt'>;
  export type UpdateRule = Pick<Rule, 'id'> & Partial<Omit<Rule, 'id' | 'createdAt' | 'updatedAt'>>;
  export type CreateAppearance = Omit<Appearance, 'id' | 'createdAt' | 'updatedAt'>;
  export type UpdateAppearance = Partial<Omit<Appearance, 'shop' | 'createdAt' | 'updatedAt'>>;
  export interface GetWixProductsQuery extends DefaultPaginationRequest {
    filter?: string;
    specificIds?: string;
    title?: string;
  }
  export interface GetWixCollectionsQuery extends DefaultPaginationRequest {
    name?: string;
  }
}
