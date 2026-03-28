import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { SendEventDto } from 'src/modules/customer-io/dto/customer-io.dto';
import { unixTimestamp } from 'src/shared/common/utils/functions';
import { CustomerIOProcess, QueueProcessor } from 'src/shared/queue/types/queue.enum';

@Injectable()
export class CustomerIoService {
  constructor(
    @InjectQueue(QueueProcessor.CustomerIO)
    private customerIoQueue: Queue,
  ) {}
  async sendEvent(body: SendEventDto) {
    const { event, shop } = body;
    const customerIOData = {
      name: event,
      created_at: unixTimestamp(),
      shop,
    };

    this.customerIoQueue.add(CustomerIOProcess.Register, { shop, data: customerIOData });
    this.customerIoQueue.add(CustomerIOProcess.SendEvent, { shop, data: customerIOData });
    return { code: 200, status: 'success' };
  }
}
