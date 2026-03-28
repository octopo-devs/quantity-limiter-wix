import { Appearance, IWixCollectionResponse, IWixProductResponse, Rule } from '@/types/interface';

export interface DefaultResponse<T> {
  data: T;
  code: number;
  status?: string;
  message?: string;
}

export interface DefaultMetaResponse {
  pagination: {
    count: number;
    currentPage: number;
    links?: any;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

export interface DefaultPaginationResponse<T> extends DefaultResponse<T> {
  meta: DefaultMetaResponse;
}

export namespace ApiResponse {
  export interface GetRules extends DefaultPaginationResponse<Rule[]> {}
  export interface GetRule extends DefaultResponse<Rule> {}
  export interface GetAppearance extends DefaultResponse<Appearance> {}
  export interface GetWixProducts extends IWixProductResponse {}
  export interface GetWixCollections extends IWixCollectionResponse {}
}
