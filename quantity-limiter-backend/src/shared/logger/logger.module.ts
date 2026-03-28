import { Module } from '@nestjs/common';
import { DefaultLoggerService } from './services/default-logger.service';

@Module({
  providers: [DefaultLoggerService],
  exports: [DefaultLoggerService],
})
export class LoggerModule {}
