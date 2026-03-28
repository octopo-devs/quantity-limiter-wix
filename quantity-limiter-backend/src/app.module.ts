import { BullModule } from '@nestjs/bull';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { AdminModule } from './modules/admin/admin.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AttributesModule } from './modules/attributes/attributes.module';
import { BrandingModule } from './modules/branding/branding.module';
import { CustomerIoModule } from './modules/customer-io/customer-io.module';
import { FileModule } from './modules/file/file.module';
import { PublicEndpointModule } from './modules/public-endpoint/public-endpoint.module';
import { RulesModule } from './modules/rules/rules.module';
import { ShopModule } from './modules/shop/shop.module';
import { WebhookModule } from './modules/webhook/webhook.module';
import { WixModule } from './modules/wix/wix.module';
import { CronModule } from './shared/cron/cron.module';
import { DatabaseModule } from './shared/database/database.module';
import { HealthModule } from './shared/health/health.module';
import { LoggingMiddleware } from './shared/middlewares/logging.middleware';
import { QUEUE_OPTIONS, QUEUE_PREFIX } from './shared/queue/types/queue.constant';
import { SharedModule } from './shared/shared.module';

@Module({
  imports: [
    DatabaseModule,
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT) || 6379,
      },
      prefix: QUEUE_PREFIX,
      defaultJobOptions: QUEUE_OPTIONS,
    }),
    CronModule,
    SharedModule,
    WixModule,
    ShopModule,
    WebhookModule,
    AttributesModule,
    FileModule,
    AdminModule,
    AnalyticsModule,
    PublicEndpointModule,
    CustomerIoModule,
    HealthModule,
    RulesModule,
    BrandingModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).exclude('webhook/(.*)').forRoutes('*');
  }
}
