import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CustomerIoService } from './customer-io.service';
import { HeaderAuthGuard } from 'src/shared/auth/guards/header-auth.guard';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DefaultResponse } from 'src/docs/default/default-response.swagger';
import { SendEventDto } from 'src/modules/customer-io/dto/customer-io.dto';

@Controller('customer-io')
@ApiTags('Customer IO')
@ApiBearerAuth('token')
@UseGuards(HeaderAuthGuard)
export class CustomerIoController {
  constructor(private readonly customerIoService: CustomerIoService) {}
  @Post('send-event')
  @ApiOperation({ summary: 'Send event to customer io' })
  @ApiOkResponse({ type: DefaultResponse })
  sendEvent(@Body() body: SendEventDto) {
    return this.customerIoService.sendEvent(body);
  }
}
