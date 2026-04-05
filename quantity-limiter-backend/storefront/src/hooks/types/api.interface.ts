export interface ICommonResponse {
  code: number;
  status: string;
  message: string;
}

export interface IApiPayload {
  params?: Record<string, unknown>;
  replacePath?: Record<string, string>;
  data?: Record<string, unknown>;
  isUsingUrlParams?: boolean;
}
