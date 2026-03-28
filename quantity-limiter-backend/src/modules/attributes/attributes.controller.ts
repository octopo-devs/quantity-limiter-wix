import { Body, Controller, Get, Post, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DefaultAuthRequest } from 'src/docs/default/default-request.swagger';
import { DefaultResponse } from 'src/docs/default/default-response.swagger';
import { GetProductSKUResponse } from 'src/modules/attributes/response/sku.response';
import { HeaderAuthGuard } from 'src/shared/auth/guards/header-auth.guard';
import { CustomCacheInterceptor } from 'src/shared/common/decorators/custom-cache.decorator';
import { AttributesService } from './attributes.service';
import { GetCollectionsDto } from './dto/collection.dto';
import { GetProductSKUesDto, GetProductsDto } from './dto/product.dto';
import { GetBrandsResponse } from './response/brand.response';
import { GetCollectionsResponse } from './response/collection.response';
import { GetProductsResponse } from './response/product.response';
import { BrandService } from './services/brand.service';
import { CollectionService } from './services/collection.service';
import { ProductService } from './services/product.service';

@Controller('attributes')
@ApiTags('Attributes')
@ApiBearerAuth('token')
@UseGuards(HeaderAuthGuard)
@UseInterceptors(CustomCacheInterceptor)
export class AttributesController {
  constructor(
    private readonly productService: ProductService,
    private readonly collectionService: CollectionService,
    private readonly vendorService: BrandService,
    private readonly attributesService: AttributesService,
  ) {}

  @Get('products')
  @ApiOperation({ summary: 'Get shop products' })
  @ApiOkResponse({ type: GetProductsResponse })
  getProducts(@Query() query: GetProductsDto) {
    return this.productService.getProducts(query);
  }

  @Get('collections')
  @ApiOperation({ summary: 'Get shop collections' })
  @ApiOkResponse({ type: GetCollectionsResponse })
  getCollections(@Query() query: GetCollectionsDto) {
    return this.collectionService.getCollections(query);
  }

  @Get('brands')
  @ApiOperation({ summary: 'Get shop brands' })
  @ApiOkResponse({ type: GetBrandsResponse })
  getBrands(@Query() query: DefaultAuthRequest) {
    return this.vendorService.getBrands(query);
  }

  @Post('sync')
  @ApiOperation({ summary: 'Sync shopify products and collections' })
  @ApiOkResponse({ type: DefaultResponse })
  syncAttributes(@Body() body: DefaultAuthRequest) {
    return this.attributesService.syncAttributes(body);
  }

  @Post('sync-products-allShop')
  @ApiOperation({ summary: 'Sync shopify all shop' })
  @ApiOkResponse({ type: DefaultResponse })
  syncAllShopProducts() {
    return this.attributesService.syncAllShopProducts();
  }

  @Get('skus')
  @ApiOperation({ summary: 'Get shop SKUs' })
  @ApiOkResponse({ type: GetProductSKUResponse })
  getShopSKUs(@Query() query: GetProductSKUesDto) {
    return this.productService.getShopSKUs(query);
  }
}
