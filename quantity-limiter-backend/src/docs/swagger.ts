import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { apiReference, ApiReferenceConfiguration } from '@scalar/express-api-reference';
import type { Express, Request, Response } from 'express';
import { SWAGGER_CONFIG } from './swagger.config';

export const SCALAR_CONFIG: Partial<ApiReferenceConfiguration> = {
  theme: 'elysiajs',
  layout: 'classic',
  showSidebar: true,
  documentDownloadType: 'both',
  hideTestRequestButton: false,
  hideClientButton: true,
  darkMode: true,
  favicon: 'https://lh3.googleusercontent.com/a/ACg8ocLsd74diDiWkWfiPj6RpmFFCDj_kbO8UyA0EeIX1y5BKA8P1OQ=s288-c-no',
};

/**
 * Creates the OpenAPI document for the application
 * @param app - NestJS application instance
 * @returns OpenAPI document
 */
export const createDocument = (app: INestApplication): OpenAPIObject => {
  const swaggerConfig = new DocumentBuilder()
    .setTitle(SWAGGER_CONFIG.title)
    .setDescription(SWAGGER_CONFIG.description)
    .setVersion(SWAGGER_CONFIG.version);

  if (SWAGGER_CONFIG.apiKey) {
    swaggerConfig.addApiKey(SWAGGER_CONFIG.apiKey, SWAGGER_CONFIG.apiKeyName);
  }
  const config = swaggerConfig.build();

  return SwaggerModule.createDocument(app, config);
};

/**
 * Sets up Scalar API Reference UI
 * @param app - NestJS application instance
 * @param path - Path where the API documentation will be served
 */
export const setupScalar = (app: INestApplication, apiPrefix: string): void => {
  const expressApp: Express = app.getHttpAdapter().getInstance();
  const document: OpenAPIObject = createDocument(app);
  const openApiPath: string = `/${apiPrefix}/openapi.json`;
  const scalarPath: string = `/${apiPrefix}/documentation`;
  expressApp.get(openApiPath, (_req: Request, res: Response) => {
    res.json(document);
  });
  expressApp.use(
    scalarPath,
    apiReference({
      ...SCALAR_CONFIG,
      url: openApiPath,
    }),
  );
};
