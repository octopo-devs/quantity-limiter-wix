import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { DEFAULT_PER_PAGE } from 'src/shared/common/types/shared.constant';
import { SortDirection } from 'src/shared/common/types/shared.enum';

export class DefaultAuthRequest {
  @IsString()
  @IsNotEmpty()
  shop: string;
}

export class DefaultPaginationRequest {
  @IsNumber()
  @Transform(({ value }) => Number(value) || 1)
  @Min(1)
  page: number;

  @IsNumber()
  @Transform(({ value }) => Number(value) || DEFAULT_PER_PAGE)
  @Min(-1)
  perPage: number;

  @IsOptional()
  @IsEnum(SortDirection)
  sortDirection?: SortDirection;
}
