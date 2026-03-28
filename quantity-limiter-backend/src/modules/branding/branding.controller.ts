import { Body, Controller, Delete, Get, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DefaultResponse } from 'src/docs/default/default-response.swagger';
import { HeaderAuthGuard } from 'src/shared/auth/guards/header-auth.guard';
import { CreateBrandingDto, GetBrandingDto, UpdateBrandingDto } from './dto/branding.dto';
import { CreateBrandingResponse, GetBrandingResponse, UpdateBrandingResponse } from './response/branding.response';
import { BrandingService } from './branding.service';

@Controller('branding')
@ApiTags('Branding')
// @ApiBearerAuth('token')
// @UseGuards(HeaderAuthGuard)
export class BrandingController {
  constructor(private readonly brandingService: BrandingService) {}

  @Get()
  @ApiOperation({ summary: 'Get branding configuration for shop' })
  @ApiOkResponse({ type: GetBrandingResponse })
  @ApiNotFoundResponse({ type: DefaultResponse })
  getBranding(@Query() query: GetBrandingDto): Promise<GetBrandingResponse> {
    return this.brandingService.getBranding(query);
  }

  @Post()
  @ApiOperation({ summary: 'Create branding configuration' })
  @ApiOkResponse({ type: CreateBrandingResponse })
  createBranding(@Body() body: CreateBrandingDto): Promise<CreateBrandingResponse> {
    return this.brandingService.createBranding(body);
  }

  @Put()
  @ApiOperation({ summary: 'Update branding configuration' })
  @ApiOkResponse({ type: UpdateBrandingResponse })
  @ApiNotFoundResponse({ type: DefaultResponse })
  updateBranding(@Query() query: GetBrandingDto, @Body() body: UpdateBrandingDto): Promise<UpdateBrandingResponse> {
    return this.brandingService.updateBranding({ ...query, ...body });
  }

  @Delete()
  @ApiOperation({ summary: 'Delete branding configuration' })
  @ApiOkResponse({ type: DefaultResponse })
  @ApiNotFoundResponse({ type: DefaultResponse })
  deleteBranding(@Query() query: GetBrandingDto): Promise<DefaultResponse> {
    return this.brandingService.deleteBranding(query);
  }
}
