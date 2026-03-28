import { Controller, Get, Query, Redirect, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { UnauthorizedResponse } from 'src/docs/default/default-response.swagger';
import { HeaderAuthGuard } from 'src/shared/auth/guards/header-auth.guard';
import { GetCollectionsWixDto, GetProductsDto, WixAppDto } from './dto/wix.dto';
import { WixService } from './wix.service';
import { IWixCollectionResponse, IWixProductResponse } from './types/wix.interface';

@Controller('wix')
@ApiTags('Wix')
export class WixController {
  constructor(private readonly wixService: WixService) {}

  @Get('install-app')
  @ApiOperation({ summary: 'Redirect user to authentication logic' })
  @ApiOkResponse({ description: 'Redirect user to authentication logic' })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse, description: 'Validate request failed' })
  @Redirect()
  handleRedirectApp(@Query() query: { url: string }) {
    return this.wixService.redirectApp(query);
  }

  @Get('authorization')
  @ApiOperation({ summary: 'Handle app install flow' })
  @ApiOkResponse({ description: 'Redirect user to app page' })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse, description: 'Validate request failed' })
  @Redirect()
  handleInstallApp(@Query() query: WixAppDto) {
    return this.wixService.handleGetTokenAndRedirect(query);
  }

  // @Post('webhook/payment')
  // @UseGuards(WebhookAuthGuard)
  // @ApiOperation({ summary: 'Handle wix callback charge event' })
  // async payment(@Body() body) {
  //   return await this.wixService.planUpdate(body);
  // }

  @Get('products')
  @ApiOperation({ summary: 'Handle get products of shop' })
  @ApiBearerAuth('token')
  @UseGuards(HeaderAuthGuard)
  async getProducts(@Query() query: GetProductsDto): Promise<IWixProductResponse> {
    return await this.wixService.handleGetProducts(query);
  }

  // @Get('shop-metafield')
  // @ApiOperation({ summary: 'Get shopify shop metafield' })
  // getShopMetafield(@Query() query: DefaultAuthRequest) {
  //   return this.wixService.getShopMetafield(query);
  // }

  // @Put('update-webhook')
  // @ApiOperation({ summary: 'Update shopify webhook' })
  // updateStoreWebhook(@Query('shop') shop?: string) {
  //   return this.wixService.updateWebhook(shop);
  // }

  // @Get('webhook-list')
  // listShopWebhooks(@Query('shop') shop: string) {
  //   return this.wixService.listShopWebhooks(shop);
  // }

  // @Get('product/metafields')
  // @ApiOperation({ summary: 'Api get products metafields' })
  // getShopProductMetafields(@Query() query) {
  //   return;
  // }

  @Get('collections')
  @ApiOperation({ summary: 'Handle get collections of shop' })
  @ApiBearerAuth('token')
  @UseGuards(HeaderAuthGuard)
  async getCollections(@Query() query: GetCollectionsWixDto): Promise<IWixCollectionResponse> {
    return await this.wixService.handleGetCollections(query);
  }

  @Get('test')
  test(@Query('shop') shop: string) {
    return this.wixService.getAppPricingPlans(shop);
  }
}
