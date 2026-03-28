import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { UnauthorizedResponse } from 'src/docs/default/default-response.swagger';
import { WebhookAuthGuard } from 'src/shared/auth/guards/webhook-auth.guard';
import { WebhookSuccess } from './response/webhook.response';
import { WebhookService } from './webhook.service';

//handle lai web hook topic

@Controller('webhook')
@ApiTags('Webhook')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  // @Post('shopify')
  // @ApiOperation({ summary: 'Handle shopify webhook' })
  // @ApiOkResponse({ type: WebhookSuccess, description: 'Received webhook' })
  // @ApiUnauthorizedResponse({ type: UnauthorizedResponse, description: 'Validate webhook request failed' })
  // @UseGuards(WebhookAuthGuard)
  // @HttpCode(200)
  // handleShopifyWebhook(@Req() req: any) {
  //   this.webhookService.handleShopifyWebhook(req);
  //   return { data: 'success' };
  // }

  // @Post('mandatory')
  // @ApiOperation({ summary: 'Handle shopify mandatory webhook' })
  // @ApiOkResponse({ type: WebhookSuccess, description: 'Received webhook' })
  // @HttpCode(200)
  // handleShopifyMandatoryWebhook(@Req() req: any) {
  //   this.webhookService.handleShopifyMandatoryWebhook(req);
  //   return { data: 'success' };
  // }

  @Post('wix')
  @ApiOperation({ summary: 'Handle wix webhook' })
  @ApiOkResponse({ type: WebhookSuccess, description: 'Received webhook' })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse, description: 'Validate webhook request failed' })
  @UseGuards(WebhookAuthGuard)
  @HttpCode(200)
  async handleWixWebhook(@Body() body) {
    return await this.webhookService.handleWixWebhook(body);
  }
}
