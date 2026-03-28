import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DefaultResponse } from 'src/docs/default/default-response.swagger';
import { DisplayType, TextAlign } from '../types/branding.enum';

export class BrandingResponse {
  @ApiProperty({ description: 'Shop identifier', example: 'shop-name' })
  shop: string;

  @ApiProperty({
    description: 'Display type',
    enum: DisplayType,
    example: DisplayType.INLINE,
  })
  displayType: DisplayType;

  @ApiProperty({ description: 'Background color', example: '#FFD466' })
  backgroundColor: string;

  @ApiProperty({ description: 'Text color', example: '#4A4A4A' })
  textColor: string;

  @ApiPropertyOptional({ description: 'Font family', example: 'Arial, sans-serif' })
  fontFamily?: string;

  @ApiProperty({
    description: 'Text alignment',
    enum: TextAlign,
    example: TextAlign.LEFT,
  })
  textAlign: TextAlign;

  @ApiProperty({ description: 'Font size', example: 14 })
  fontSize: number;

  @ApiPropertyOptional({ description: 'Custom CSS', example: '.custom-class { margin: 10px; }' })
  customCss?: string;

  @ApiProperty({ description: 'Created at timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at timestamp' })
  updatedAt: Date;
}

export class GetBrandingResponse extends DefaultResponse {
  @ApiProperty({ description: 'Branding data', type: BrandingResponse })
  data: BrandingResponse;
}

export class CreateBrandingResponse extends DefaultResponse {
  @ApiProperty({ description: 'Created branding data', type: BrandingResponse })
  data: BrandingResponse;
}

export class UpdateBrandingResponse extends DefaultResponse {
  @ApiProperty({ description: 'Updated branding data', type: BrandingResponse })
  data: BrandingResponse;
}

