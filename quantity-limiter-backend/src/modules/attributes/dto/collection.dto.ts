import { IntersectionType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { DefaultAuthRequest, DefaultPaginationRequest } from 'src/docs/default/default-request.swagger';

export class GetCollectionsDto extends IntersectionType(DefaultPaginationRequest, DefaultAuthRequest) {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  includeCollectionIds?: string;
}
