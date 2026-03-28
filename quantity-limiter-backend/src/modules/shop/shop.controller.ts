import { CacheTTL } from '@nestjs/cache-manager';
import { Body, Controller, Get, Post, Put, Query, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { DefaultAuthRequest } from 'src/docs/default/default-request.swagger';
import { DefaultResponse } from 'src/docs/default/default-response.swagger';
import { HeaderAuthGuard } from 'src/shared/auth/guards/header-auth.guard';
import { CustomCacheInterceptor } from 'src/shared/common/decorators/custom-cache.decorator';
import { UpdateGeneralSettingDto, UpdateOnboardingDto } from './dto/shop.dto';
import {
  GetCannyTokenResponse,
  GetShopInfoResponse,
  ShopCrispDataResponse,
  ShopGeneralSettingResponse,
  UpdateShopGeneralSettingResponse,
} from './response/shop.response';
import { ShopService } from './shop.service';

@Controller('shop')
@ApiTags('Shop')
@UseInterceptors(CustomCacheInterceptor)
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @Get('info')
  @ApiBearerAuth('token')
  @UseGuards(HeaderAuthGuard)
  @ApiOperation({ summary: 'Get shop info' })
  @ApiOkResponse({ type: GetShopInfoResponse })
  getShopInfo(@Query() query: DefaultAuthRequest) {
    return this.shopService.getShopInfo(query);
  }

  @Put('onboarding/update')
  @ApiBearerAuth('token')
  @UseGuards(HeaderAuthGuard)
  @ApiOperation({ summary: 'Update completed onboarding' })
  @ApiOkResponse({ type: DefaultResponse })
  updateOnboarding(@Body() body: UpdateOnboardingDto) {
    return this.shopService.updateOnboarding(body);
  }

  @Get('general-settings')
  @ApiBearerAuth('token')
  @UseGuards(HeaderAuthGuard)
  @ApiOperation({ summary: 'Get shop general setting' })
  @ApiOkResponse({ type: ShopGeneralSettingResponse })
  getShopGeneralSetting(@Query() query: DefaultAuthRequest, @Req() request: Request) {
    return this.shopService.getShopGeneral(query, request.user);
  }

  @Put('general-settings/update')
  @ApiBearerAuth('token')
  @UseGuards(HeaderAuthGuard)
  @ApiOperation({ summary: 'Update shop general setting' })
  @ApiOkResponse({ type: UpdateShopGeneralSettingResponse })
  updateShopGeneralSetting(@Body() body: UpdateGeneralSettingDto) {
    return this.shopService.updateShopGeneral(body);
  }

  @Get('crisp/data')
  @ApiOperation({ summary: 'Get shop crisp info' })
  @ApiOkResponse({ type: ShopCrispDataResponse })
  getShopCrispData(@Query('shop') shop: string) {
    return this.shopService.getShopCrispData(shop);
  }

  @Get('canny-token')
  @ApiBearerAuth('token')
  @UseGuards(HeaderAuthGuard)
  @ApiOperation({ summary: 'Get canny token' })
  @ApiOkResponse({ type: GetCannyTokenResponse })
  @ApiNotFoundResponse({ type: DefaultResponse })
  @CacheTTL(10 * 1000)
  getCannyToken(@Query('shop') shop: string) {
    return this.shopService.getCannyToken(shop);
  }

  @Post('test')
  test(@Query('shop') shop: string) {
    return this.shopService.test(shop);
  }
}
