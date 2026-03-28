import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { CustomerIOProcess, QueueProcessor } from 'src/shared/queue/types/queue.enum';
import { CustomerIoApiService } from 'src/shared/api/services/customer-io-api.service';
import { IRegisterCustomerIo, ISendCustomerIoEvent, IUpdateAndRemoveCustomerIo } from '../types/customer-io.interface';

@Processor(QueueProcessor.CustomerIO)
export class CustomerIoProcessor {
  constructor(private readonly customerIoApiService: CustomerIoApiService) {}

  @Process(CustomerIOProcess.SendEvent)
  async sendCustomerIoEvent(job: Job<ISendCustomerIoEvent>) {
    if (!process.env.CIO_SITE_ID) return;
    const { email, shop, data = {} } = job.data;
    await this.customerIoApiService.sendEventCustomerIo(email, shop, data);
  }

  @Process(CustomerIOProcess.Register)
  async registerCustomerIo(job: Job<IRegisterCustomerIo>) {
    if (!process.env.CIO_SITE_ID) return;
    const { email, shop, data = {} } = job.data;
    await this.customerIoApiService.registerCustomerIo(email, shop, data);
  }

  @Process(CustomerIOProcess.Remove)
  async removeCustomerIo(job: Job<IUpdateAndRemoveCustomerIo>) {
    if (!process.env.CIO_SITE_ID) return;
    const { email } = job.data;
    await this.customerIoApiService.callCustomerIoTrackServices('DELETE', 'REMOVE_CUSTOMER', {
      replacePath: { email },
    });
  }

  @Process(CustomerIOProcess.Update)
  async updateCustomerIo(job: Job<IUpdateAndRemoveCustomerIo>) {
    if (!process.env.CIO_SITE_ID) return;
    const { email, data } = job.data;
    const customerInfo = await this.customerIoApiService.callCustomerIoAppServices('GET', 'INFO_CUSTOMER', {
      params: { email },
    });
    if (!customerInfo?.results?.length) return;
    const { results } = customerInfo,
      listCustomer = [...new Set(results.map(({ cio_id }) => cio_id))];
    for (const customerId of listCustomer) {
      await this.customerIoApiService.callCustomerIoTrackServices('PUT', 'UPDATE_CUSTOMER', {
        replacePath: { id: `cio_${customerId}` },
        data: { ...data, _update: true },
      });
    }
  }
}
