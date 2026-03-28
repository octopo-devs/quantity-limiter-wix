import { Module } from '@nestjs/common';
import { CustomerIoController } from './customer-io.controller';
import { CustomerIoService } from './customer-io.service';

@Module({
  controllers: [CustomerIoController],
  providers: [CustomerIoService],
})
export class CustomerIoModule {}
