import { IsString } from 'class-validator';

export class GetPublicMetafieldDto {
  @IsString()
  shop: string;

  @IsString()
  key: string;
}

export class GetTrackedInventoryDto extends GetPublicMetafieldDto {
  @IsString()
  variantId: string;
}

export class GetProductMetafieldDto extends GetPublicMetafieldDto {
  @IsString()
  productId: string;
}

export class GetVariantMetafieldDto extends GetPublicMetafieldDto {
  @IsString()
  variantId: string;
}

export class GetWixProductInfoDto extends GetPublicMetafieldDto {
  @IsString()
  productId?: string;
}

export class GetWixCartInfoDto extends GetPublicMetafieldDto {
  @IsString()
  cartId: string;
}
