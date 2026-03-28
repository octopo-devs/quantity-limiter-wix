import { InjectQueue } from '@nestjs/bull';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bull';
import { Repository } from 'typeorm';
import { WixApiService } from 'src/shared/api/services/wix-api.service';
import { IShopifyAppMetafieldPayloadRule } from 'src/shared/api/types/wix-api/wix-api.interface';
import { generateHmacKey } from 'src/shared/common/utils/functions';
import { QueueProcessor } from 'src/shared/queue/types/queue.enum';
import { Rule } from '../rules/entities/rule.entity';
import { ProductService } from '../attributes/services/product.service';
import { ShopService } from '../shop/shop.service';
import { GetPublicMetafieldDto, GetWixCartInfoDto, GetWixProductInfoDto } from './dto/public-endpoint.dto';

@Injectable()
export class PublicEndpointService {
  private readonly PUBLIC_API_HMAC_KEY = process.env.PUBLIC_API_HMAC_KEY;
  constructor(
    private readonly wixApiService: WixApiService,
    private readonly shopService: ShopService,
    private readonly productService: ProductService,
    @InjectRepository(Rule)
    private readonly ruleRepository: Repository<Rule>,
    @InjectQueue(QueueProcessor.CustomerIO)
    private readonly customerIoQueue: Queue,
  ) {}

  async shopMetafieldsPublic(payload: GetPublicMetafieldDto) {
    const hmac = generateHmacKey(payload.shop, this.PUBLIC_API_HMAC_KEY);
    console.log(hmac);

    if (hmac !== payload.key) throw new UnauthorizedException('Key invalid');
    const metafield = await this.getShopMetafield(payload.shop);
    return metafield;
  }

  async getCurrentWixProductInfoPublic(payload: GetWixProductInfoDto) {
    const { shop, key } = payload;
    const hmac = generateHmacKey(shop, this.PUBLIC_API_HMAC_KEY);
    if (hmac !== key) throw new UnauthorizedException('Key invalid');
    return this.wixApiService.getProductByIdV1(shop, payload.productId);
  }

  async getCurrentWixCartInfoPublic(payload: GetWixCartInfoDto) {
    const { shop, key } = payload;
    const hmac = generateHmacKey(shop, this.PUBLIC_API_HMAC_KEY);
    if (hmac !== key) throw new UnauthorizedException('Key invalid');
    return this.wixApiService.getCurrentCartInfoV1(shop);
  }

  async getShopMetafield(shop: string): Promise<IShopifyAppMetafieldPayloadRule> {
    const shopGeneral = await this.shopService.findOneShopGeneral({
      where: { shop },
      relations: ['branding'],
    });

    const rules = await this.ruleRepository.find({
      where: { shop, isActive: true },
    });

    const metafields: IShopifyAppMetafieldPayloadRule = {
      rootLink: process.env.APP_SERVER_DOMAIN,
      data: {
        settings: shopGeneral,
        branding: shopGeneral?.branding ?? null,
        rules,
      },
      isABTest: true,
      shop,
    };
    return metafields;
  }

  async getDataProduct(idProduct: string, variantIds: string, shop: string): Promise<any> {
    const product = await this.productService.findOneProduct({
      where: { product_id: idProduct, shop },
      relations: ['variants'],
    });
    if (!product) return null;
    const variants = variantIds
      ? product.variants
          .filter((variant) => variantIds?.split(',').includes(variant?.legacyResourceId))
          .map((variant) => variant.displayName)
      : [];
    return {
      name: product.title,
      ...(variants.length > 0 && { variants }),
    };
  }
}
