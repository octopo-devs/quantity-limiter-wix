import { Process, Processor } from '@nestjs/bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from 'bull';
import { AttributesService } from 'src/modules/attributes/attributes.service';
import { Product } from 'src/modules/attributes/entities/product/product.entity';
import { ShopInfo } from 'src/modules/shop/entities/shop-info.entity';
import { Repository } from 'typeorm';
import { QueueProcessor, WixQueueProcess } from '../types/queue.enum';
import { ISendWixQueueEvent } from '../types/wix-queue.interface';
import { IWixProduct, IWixProductVariant } from 'src/modules/wix/types/wix.interface';
import { ProductVariant } from 'src/modules/attributes/entities/product/product-variant.entity';
import { ProductSKU } from 'src/modules/attributes/entities/product/product-sku.entity';
import { WixApiService } from 'src/shared/api/services/wix-api.service';

@Processor(QueueProcessor.Wix)
export class ShopifyProcessor {
  constructor(
    private readonly attributesService: AttributesService,
    private readonly wixApiService: WixApiService,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ShopInfo)
    private readonly shopInfoRepository: Repository<ShopInfo>,
    @InjectRepository(ProductVariant)
    private readonly productVariantRepository: Repository<ProductVariant>,
    @InjectRepository(ProductSKU)
    private readonly productSKURepository: Repository<ProductSKU>,
  ) {}

  handleCreateProductVariant(
    data: IWixProductVariant[],
    shop: string,
    dataExist?: ProductVariant[],
    productExistId?: number,
  ): ProductVariant[] {
    try {
      if (!data?.length) return [];
      return data
        .map((item) => {
          const { id, choices, variant } = item;
          if (Object.keys(choices).length < 1) return;
          const productVariantExist = dataExist?.find((variant) => variant.legacyResourceId === id);

          let displayName = '';
          Object.values(choices).forEach((value) => (displayName += displayName?.length ? `/${value}` : value));

          return this.productVariantRepository.create({
            id: productVariantExist?.id,
            shop,
            legacyResourceId: id,
            sku: variant?.sku,
            displayName,
            attributesProductId: productExistId,
          });
        })
        .filter((item) => !!item);
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  async upsertShopProduct(shop: string, product: IWixProduct): Promise<void> {
    const { id, productType, visible, name, brand, variants, media, sku, ribbon, collectionIds } = product;

    const productExist = await this.productRepository.findOne({
      where: { shop, product_id: id },
      relations: ['variants'],
    });
    const productInstance = this.productRepository.create({
      id: productExist?.id,
      shop,
      product_id: id,
      productType,
      visible,
      title: name,
      brand,
      ribbon,
      image: media?.mainMedia?.thumbnail?.url,
      variants: this.handleCreateProductVariant(variants, shop, productExist?.variants, productExist?.id),
    });

    try {
      await this.productRepository.save(productInstance);
    } catch (err) {
      console.log(err);
    }
    if (!sku) return;

    const skuExist = await this.productSKURepository.findOne({ where: { shop, product_sku: sku } });
    if (!skuExist) {
      try {
        await this.productSKURepository.save({ shop, product_sku: sku });
      } catch (err) {
        console.log(err);
      }
    }

    await this.attributesService.handleSyncWixProductCollection({ shop, productId: id, collectionIds });
  }

  @Process(WixQueueProcess.SyncDataProcess)
  async syncDataShopify(job: Job<ISendWixQueueEvent>) {
    setTimeout(async () => {
      const { shop, productId } = job.data;
      const product: IWixProduct = await this.wixApiService.getProductByIdV1(shop, productId);
      if (!product) return;
      this.upsertShopProduct(shop, product);
    }, 5000);
  }
}
