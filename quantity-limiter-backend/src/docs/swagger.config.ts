import { SecuritySchemeObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { ApiReferenceConfiguration } from '@scalar/express-api-reference';

interface ISwaggerConfig {
  title: string;
  description: string;
  version: string;
  apiKey: SecuritySchemeObject;
  apiKeyName: string;
}

export const SWAGGER_CONFIG: ISwaggerConfig = {
  title: 'Order limiter Nestjs',
  description: 'Order limiter Nestjs API doc',
  version: 'neutral',
  apiKey: {
    type: 'apiKey',
    name: 'authorization',
    description: 'enter token',
  },
  apiKeyName: 'token',
};
