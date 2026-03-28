import { Injectable } from '@nestjs/common';
import { DefaultAuthRequest } from 'src/docs/default/default-request.swagger';
import { GetBrandsResponse } from '../response/brand.response';
import { ProductService } from './product.service';

@Injectable()
export class BrandService {
  constructor(private readonly productService: ProductService) {}
  async getBrands(payload: DefaultAuthRequest): Promise<GetBrandsResponse> {
    const allBrands = await this.productService.getProductBrands(payload.shop);
    const brands = [...new Set(allBrands)].filter((brand) => !!brand).sort((a, b) => a.localeCompare(b));
    return {
      code: 200,
      data: brands,
      status: 'success',
    };
  }
}
