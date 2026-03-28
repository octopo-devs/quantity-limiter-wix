import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bull';
import { ProductSKU } from 'src/modules/attributes/entities/product/product-sku.entity';
import { GetProductSKUResponse } from 'src/modules/attributes/response/sku.response';
import { EventEmitterName } from 'src/shared/common/types/shared.enum';
import { formatMetaResponse } from 'src/shared/common/utils/functions';
import { QueueProcessor, WixQueueProcess } from 'src/shared/queue/types/queue.enum';
import { FindManyOptions, FindOneOptions, FindOptionsWhere, In, Like, Repository } from 'typeorm';
import { GetProductSKUesDto, GetProductsDto } from '../dto/product.dto';
import { Product } from '../entities/product/product.entity';
import { GetProductsResponse } from '../response/product.response';
import { IProductRemove, IProductUpdate } from '../types/attributes.interface';
@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductSKU)
    private readonly productSKURepository: Repository<ProductSKU>,
    @InjectQueue(QueueProcessor.Wix)
    private wixQueue: Queue,
  ) {}

  async getProducts(payload: GetProductsDto): Promise<GetProductsResponse> {
    const { page, perPage, shop, name, vendors, productIds, includeProductIds, sortDirection } = payload;
    const skip = Math.max((page - 1) * perPage, 0);
    const take = perPage === -1 ? undefined : perPage;
    const where: FindOptionsWhere<Product> = { shop };
    if (name) where.title = Like(`%${name}%`);
    if (vendors) where.brand = In(vendors.split(','));
    if (productIds) where.product_id = In(productIds.split(','));
    const [products, total] = await this.productRepository.findAndCount({
      where,
      skip,
      take,
      relations: ['variants'],
      order: { title: sortDirection || 'DESC' },
    });
    const productsWithUpdatedVariants = products.map((product) => {
      const updatedVariants = product.variants?.map((variant) => {
        const { legacyResourceId, ...rest } = variant;
        return { ...rest, id: legacyResourceId };
      });
      return { ...product, variants: JSON.stringify(updatedVariants) };
    });
    let totalProducts: number;
    if (includeProductIds) {
      const includeProducts = await this.productRepository.find({
        where: { shop, product_id: In(includeProductIds.split(',')) },
        relations: ['variants'],
      });
      const includeProductsUpdateVariants = includeProducts.map((product) => {
        const updatedVariants = product.variants?.map((variant) => {
          const { legacyResourceId, ...rest } = variant;
          return { ...rest, id: legacyResourceId };
        });
        return { ...product, variants: JSON.stringify(updatedVariants?.length ? updatedVariants : []) };
      });
      const existingProductIds = new Set(productsWithUpdatedVariants.map((product) => product.product_id));
      const filteredIncludeProducts = includeProductsUpdateVariants.filter(
        (product) => !existingProductIds.has(product.product_id),
      );
      productsWithUpdatedVariants.push(...filteredIncludeProducts);
      totalProducts = total + filteredIncludeProducts.length;
    }
    return {
      code: 200,
      status: 'success',
      meta: formatMetaResponse(page, perPage, totalProducts || total, productsWithUpdatedVariants.length),
      data: productsWithUpdatedVariants,
    };
  }

  async findOneProduct(options: FindOneOptions<Product>): Promise<Product> {
    return await this.productRepository.findOne(options);
  }

  async findProducts(options: FindManyOptions<Product>): Promise<Product[]> {
    return await this.productRepository.find(options);
  }

  async getProductBrands(shop: string): Promise<string[]> {
    const productBrands: { brand: string }[] = await this.productRepository
      .createQueryBuilder()
      .select('brand')
      .where({ shop })
      .groupBy('brand')
      .getRawMany();
    return productBrands.map(({ brand }) => brand);
  }

  async getProductRibbons(shop: string): Promise<string[]> {
    const productRibbons: { ribbon: string }[] = await this.productRepository
      .createQueryBuilder()
      .select('ribbon')
      .where({ shop })
      .groupBy('ribbon')
      .getRawMany();
    return productRibbons.map(({ ribbon }) => ribbon);
  }

  // async findManyProductTag(options: FindManyOptions<ProductRibbon>): Promise<ProductRibbon[]> {
  //   return await this.productTagRepository.find(options);
  // }

  // async getProductTags(payload: GetProductTagsDto): Promise<GetProductTagsResponse> {
  //   const { page, perPage, shop, name, includeProductTags } = payload;
  //   const skip = Math.max((page - 1) * perPage, 0);
  //   const take = perPage === -1 ? undefined : perPage;
  //   const where: FindOptionsWhere<ProductRibbon> = { shop };
  //   if (name) where.product_ribbon = Like(`%${name}%`);
  //   const [tags, total] = await this.productTagRepository.findAndCount({
  //     where,
  //     skip,
  //     take,
  //     order: { product_ribbon: 'DESC' },
  //   });
  //   let totalProductTags: number;
  //   if (includeProductTags) {
  //     const productTags = await this.productTagRepository.find({
  //       where: { shop, product_ribbon: In(includeProductTags.split(',')) },
  //     });
  //     const existingProductTags = new Set(tags.map((tag) => tag.product_ribbon));
  //     const filteredIncludeProductTags = productTags.filter((tag) => !existingProductTags.has(tag.product_ribbon));
  //     tags.push(...filteredIncludeProductTags);
  //     totalProductTags = total + filteredIncludeProductTags.length;
  //   }
  //   return {
  //     code: 200,
  //     status: 'success',
  //     meta: formatMetaResponse(page, perPage, totalProductTags || total, tags.length),
  //     data: tags,
  //   };
  // }

  async getShopSKUs(payload: GetProductSKUesDto): Promise<GetProductSKUResponse> {
    const { page, perPage, shop, name, includeProductSKUs } = payload;
    const skip = Math.max((page - 1) * perPage, 0);
    const take = perPage === -1 ? undefined : perPage;
    const where: FindOptionsWhere<ProductSKU> = { shop };
    if (name) where.product_sku = Like(`%${name}%`);
    const [tags, total] = await this.productSKURepository.findAndCount({
      where,
      skip,
      take,
      order: { product_sku: 'DESC' },
    });
    let totalSKUs: number;
    if (includeProductSKUs) {
      const productSKUs = await this.productSKURepository.find({
        where: { shop, product_sku: In(includeProductSKUs.split(',')) },
      });
      const existingProductSKUs = new Set(tags.map((tag) => tag.product_sku));
      const filteredIncludeProductSKUs = productSKUs.filter((tag) => !existingProductSKUs.has(tag.product_sku));
      tags.push(...filteredIncludeProductSKUs);
      totalSKUs = total + filteredIncludeProductSKUs.length;
    }
    return {
      code: 200,
      status: 'success',
      meta: formatMetaResponse(page, perPage, totalSKUs || total, tags.length),
      data: tags,
    };
  }

  @OnEvent(EventEmitterName.ProductUpdate)
  async handleShopifyProduct(payload: IProductUpdate): Promise<void> {
    const { shop, productId } = payload;

    await this.wixQueue.add(
      WixQueueProcess.SyncDataProcess,
      {
        shop,
        productId,
      },
      { attempts: 3, backoff: 5000, removeOnComplete: true, removeOnFail: true },
    );
  }

  @OnEvent(EventEmitterName.DataRemove)
  async removeProductData(payload: { shop: string }): Promise<void> {
    if (!payload.shop) return;
    try {
      await this.productRepository.delete({ shop: payload.shop });
    } catch (err) {
      console.log('removeProductData', err.message);
    }
  }

  @OnEvent(EventEmitterName.ProductRemove)
  async handleShopifyProductRemoved(payload: IProductRemove): Promise<void> {
    const { shop } = payload;
    const product_id = String(payload.id);
    const deletedProduct = await this.productRepository.findOne({ where: { shop, product_id } });
    if (!deletedProduct) return;
    await this.productRepository.delete({ shop, product_id });
  }
}
