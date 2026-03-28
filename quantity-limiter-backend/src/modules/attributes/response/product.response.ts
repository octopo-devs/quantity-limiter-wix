import { DefaultPaginationResponse } from 'src/docs/default/default-response.swagger';
import { Product } from '../entities/product/product.entity';
import { OmitType } from '@nestjs/swagger';

export class ProductWithoutVariant extends OmitType(Product, ['variants'] as const) {
  variants: string;
}
export class GetProductsResponse extends DefaultPaginationResponse {
  data: ProductWithoutVariant[];
}
