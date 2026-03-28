import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetPublicMetafieldDto, GetWixCartInfoDto, GetWixProductInfoDto } from './dto/public-endpoint.dto';
import { PublicEndpointService } from './public-endpoint.service';

@Controller('public-endpoint')
@ApiTags('Public endpoint')
export class PublicEndpointController {
  constructor(private readonly publicEndpointService: PublicEndpointService) {}

  @Get('shop-metafield')
  @ApiOperation({ summary: 'Public api for customer get metafields' })
  shopMetafieldsPublic(@Query() query: GetPublicMetafieldDto) {
    return this.publicEndpointService.shopMetafieldsPublic(query);
  }

  @Get('currentProduct')
  @ApiOperation({ summary: 'Public api for customer get current product information' })
  currentWixProductInfoPublic(@Query() query: GetWixProductInfoDto) {
    return this.publicEndpointService.getCurrentWixProductInfoPublic(query);
  }

  @Get('currentCart')
  @ApiOperation({ summary: 'Public api for customer get current product information' })
  currentWixCartInfoPublic(@Query() query: GetWixCartInfoDto) {
    return this.publicEndpointService.getCurrentWixCartInfoPublic(query);
  }
}
