import { IntersectionType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { DefaultAuthRequest, DefaultPaginationRequest } from 'src/docs/default/default-request.swagger';

export class GetProductsDto extends IntersectionType(DefaultPaginationRequest, DefaultAuthRequest) {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  vendors?: string;

  @IsOptional()
  @IsString()
  productIds?: string;

  @IsOptional()
  @IsString()
  includeProductIds?: string;
}

export class GetProductTagsDto extends IntersectionType(DefaultPaginationRequest, DefaultAuthRequest) {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  includeProductTags?: string;
}

export class GetMetafieldsAllProductsDto extends IntersectionType(DefaultPaginationRequest, DefaultAuthRequest) {
  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsString()
  includeProductMetafieldKey?: string;
}

export class GetMetafieldsAllVariantsDto extends IntersectionType(DefaultPaginationRequest, DefaultAuthRequest) {
  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsString()
  includeVariantMetafieldKey?: string;
}

export class GetProductSKUesDto extends IntersectionType(DefaultPaginationRequest, DefaultAuthRequest) {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  includeProductSKUs?: string;
}
