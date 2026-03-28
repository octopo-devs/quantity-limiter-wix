import { ClassSerializerInterceptor, VERSION_NEUTRAL, ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { useContainer } from 'class-validator';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';
import { setupScalar } from './docs/swagger';
import { GlobalLogger } from './shared/logger/services/global-logger.service';

async function bootstrap() {
  const apiPrefix = process.env.API_ENDPOINT_PREFIX || 'api';
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { logger: new GlobalLogger() });
  app.useStaticAssets('src/public', {
    prefix: `${apiPrefix}/public`,
    etag: true,
    setHeaders: (res) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
    },
  });
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: VERSION_NEUTRAL,
  });
  app.setGlobalPrefix(apiPrefix);
  app.use(json({ limit: '120mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  setupScalar(app, apiPrefix);

  app.enableCors({
    allowedHeaders: '*',
    origin: '*',
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  await app.listen(process.env.PORT || 4000);
  console.log(`API listen at port: ${process.env.PORT || 4000}`);
}

bootstrap();
