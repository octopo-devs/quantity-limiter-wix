export interface IApiPayload {
  params?: Record<string, any>;
  replacePath?: Record<string, any>;
  data?: Record<string, any>;
}

export interface IApiAuth {
  accessToken?: string;
  refreshToken?: string;
}
