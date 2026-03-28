import { IntersectionType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { DefaultAuthRequest, DefaultPaginationRequest } from 'src/docs/default/default-request.swagger';
import { DEFAULT_PER_PAGE } from 'src/shared/common/types/shared.constant';

export class WixAppDto {
  // @IsOptional()
  // hmac?: string;

  // @IsOptional()
  // host?: string;

  // @IsOptional()
  // timestamp?: string;

  // @IsOptional()
  // embedded?: string;

  // @IsOptional()
  // locale?: string;

  // @IsOptional()
  // id_token?: string;

  @IsOptional()
  instanceId?: string;

  @IsString()
  code: string;
}

export interface IWixPaging {
  limit?: number;
  offset?: number;
}

export class GetProductsDto extends IntersectionType(DefaultPaginationRequest, DefaultAuthRequest) {
  @IsOptional()
  filter?: string;

  @IsNumber()
  @Transform(({ value }) => Number(value) || 1)
  @Min(1)
  page: number;

  @IsNumber()
  @Transform(({ value }) => Number(value) || DEFAULT_PER_PAGE)
  @Min(-1)
  perPage: number;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  specificIds?: string;
}

export class GetCollectionsWixDto extends IntersectionType(DefaultPaginationRequest, DefaultAuthRequest) {
  @IsNumber()
  @Transform(({ value }) => Number(value) || 1)
  @Min(1)
  page: number;

  @IsNumber()
  @Transform(({ value }) => Number(value) || DEFAULT_PER_PAGE)
  @Min(-1)
  perPage: number;

  @IsOptional()
  @IsString()
  name?: string;
}
