import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { DefaultAuthRequest } from 'src/docs/default/default-request.swagger';
import { DisplayType, TextAlign } from '../types/branding.enum';

export class CreateBrandingDto extends DefaultAuthRequest {
  @ApiProperty({
    description: 'Display type',
    enum: DisplayType,
    example: DisplayType.INLINE,
    default: DisplayType.INLINE,
  })
  @IsEnum(DisplayType)
  @IsOptional()
  displayType?: DisplayType;

  @ApiProperty({
    description: 'Background color',
    example: '#FFD466',
    default: '#FFD466',
    maxLength: 20,
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  backgroundColor?: string;

  @ApiProperty({
    description: 'Text color',
    example: '#4A4A4A',
    default: '#4A4A4A',
    maxLength: 20,
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  textColor?: string;

  @ApiPropertyOptional({
    description: 'Font family',
    example: 'Arial, sans-serif',
  })
  @IsOptional()
  @IsString()
  fontFamily?: string;

  @ApiProperty({
    description: 'Text alignment',
    enum: TextAlign,
    example: TextAlign.LEFT,
    default: TextAlign.LEFT,
  })
  @IsEnum(TextAlign)
  @IsOptional()
  textAlign?: TextAlign;

  @ApiProperty({
    description: 'Font size',
    example: 14,
    default: 14,
    minimum: 8,
    maximum: 72,
  })
  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(72)
  @Type(() => Number)
  fontSize?: number;

  @ApiPropertyOptional({
    description: 'Custom CSS',
    example: '.custom-class { margin: 10px; }',
  })
  @IsOptional()
  @IsString()
  customCss?: string;
}

export class UpdateBrandingDto {
  @ApiPropertyOptional({
    description: 'Display type',
    enum: DisplayType,
    example: DisplayType.POPUP,
  })
  @IsEnum(DisplayType)
  @IsOptional()
  displayType?: DisplayType;

  @ApiPropertyOptional({
    description: 'Background color',
    example: '#FFD466',
    maxLength: 20,
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  backgroundColor?: string;

  @ApiPropertyOptional({
    description: 'Text color',
    example: '#4A4A4A',
    maxLength: 20,
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  textColor?: string;

  @ApiPropertyOptional({
    description: 'Font family',
    example: 'Arial, sans-serif',
  })
  @IsOptional()
  @IsString()
  fontFamily?: string;

  @ApiPropertyOptional({
    description: 'Text alignment',
    enum: TextAlign,
    example: TextAlign.CENTER,
  })
  @IsEnum(TextAlign)
  @IsOptional()
  textAlign?: TextAlign;

  @ApiPropertyOptional({
    description: 'Font size',
    example: 16,
    minimum: 8,
    maximum: 72,
  })
  @IsInt()
  @IsOptional()
  @Min(8)
  @Max(72)
  @Type(() => Number)
  fontSize?: number;

  @ApiPropertyOptional({
    description: 'Custom CSS',
    example: '.custom-class { margin: 10px; }',
  })
  @IsOptional()
  @IsString()
  customCss?: string;
}

export class GetBrandingDto extends DefaultAuthRequest {}
