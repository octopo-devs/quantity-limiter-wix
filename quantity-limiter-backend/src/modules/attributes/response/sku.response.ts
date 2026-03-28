import { DefaultPaginationResponse } from 'src/docs/default/default-response.swagger';
import { ProductSKU } from 'src/modules/attributes/entities/product/product-sku.entity';

export class GetProductSKUResponse extends DefaultPaginationResponse {
  data: ProductSKU[];
}
