import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { DefaultAuthRequest } from 'src/docs/default/default-request.swagger';
import { DefaultResponse } from 'src/docs/default/default-response.swagger';
import { CollectionProduct } from 'src/modules/attributes/entities/collection/collection-product.entity';
import { ProductSKU } from 'src/modules/attributes/entities/product/product-sku.entity';
import { ShopInfo } from 'src/modules/shop/entities/shop-info.entity';
import { IWixPaging } from 'src/modules/wix/dto/wix.dto';
import { WixApiService } from 'src/shared/api/services/wix-api.service';
import { EventEmitterName } from 'src/shared/common/types/shared.enum';
import { isTestShop } from 'src/shared/common/utils/functions';
import { In, Repository } from 'typeorm';
import { ShopInstalled } from '../shop/entities/shop-installed.entity';
import {
  IAppInstallEventPayload,
  IWixCollection,
  IWixCollectionResponse,
  IWixProduct,
  IWixProductResponse,
  IWixProductVariant,
} from '../wix/types/wix.interface';
import { AttributeCron } from './entities/attribute-cron.entity';
import { Collection } from './entities/collection/collection.entity';
import { ProductVariant } from './entities/product/product-variant.entity';
import { Product } from './entities/product/product.entity';
import { CronAttributeStatus } from './types/attributes.enum';

@Injectable()
export class AttributesService {
  constructor(
    @InjectRepository(AttributeCron)
    private readonly attributeCronRepository: Repository<AttributeCron>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductVariant)
    private readonly productVariantRepository: Repository<ProductVariant>,
    @InjectRepository(ProductSKU)
    private readonly productSKURepository: Repository<ProductSKU>,
    @InjectRepository(Collection)
    private readonly collectionRepository: Repository<Collection>,
    @InjectRepository(ShopInfo)
    private readonly shopInfoRepository: Repository<ShopInfo>,
    @InjectRepository(ShopInstalled)
    private readonly shopInstalledRepository: Repository<ShopInstalled>,
    @InjectRepository(CollectionProduct)
    private readonly collectionProductRepository: Repository<CollectionProduct>,
    private readonly wixApiService: WixApiService,
  ) {}

  async syncAttributes(payload: DefaultAuthRequest): Promise<DefaultResponse> {
    const { shop } = payload;
    if (!shop) return;
    const attributeCronExist = await this.attributeCronRepository.findOne({ where: { shop } });
    if ([CronAttributeStatus.Pending, CronAttributeStatus.Processing].includes(attributeCronExist?.status)) {
      return { code: 200, status: 'Cron is running' };
    }
    const cron = this.attributeCronRepository.create({
      shop,
      status: CronAttributeStatus.Pending,
      retry: 0,
      id: attributeCronExist?.id,
    });
    try {
      await this.attributeCronRepository.save(cron);
    } catch (err) {
      console.log(err.message);
    }
    return { code: 200, status: 'success' };
  }

  async syncProductFromWix(shop: string): Promise<void> {
    const LIMIT = 100;
    for (let page = 1; page < 100; page++) {
      const paging: IWixPaging = {
        limit: undefined,
        offset: undefined,
      };
      paging.limit = LIMIT;
      paging.offset = (page - 1) * LIMIT;

      try {
        const response: IWixProductResponse = await this.wixApiService.callWixServices(
          'POST',
          'PRODUCTS_V1',
          { query: { paging }, includeVariants: true },
          shop,
        );
        for (const product of response?.products) {
          await this.handleSyncWixProduct(shop, product);
        }

        if (!response?.products || response.products?.length < LIMIT) {
          return;
        }
      } catch (err) {
        console.log(err);
        return;
      }
    }
  }

  async syncCollectionFromWix(shop: string): Promise<void> {
    const LIMIT = 100;
    for (let page = 1; page < 100; page++) {
      const paging: IWixPaging = {
        limit: undefined,
        offset: undefined,
      };
      paging.limit = LIMIT;
      paging.offset = (page - 1) * LIMIT;

      try {
        const response: IWixCollectionResponse = await this.wixApiService.callWixServices(
          'POST',
          'COLLECTIONS_V1',
          { query: { paging }, includeVariants: true },
          shop,
        );
        for (const collection of response?.collections) {
          await this.handleSyncWixCollection(shop, collection);
        }

        if (!response?.collections || response.collections?.length < LIMIT) {
          return;
        }
      } catch (err) {
        console.log(err);
        return;
      }
    }
  }

  async syncAllShopProducts() {
    const shopInstalls = await this.shopInstalledRepository.find({ where: { uninstalled: false, closeStore: false } });
    const shopInstances = shopInstalls.map((shop) => shop.shop);
    const shopInfos = await this.shopInfoRepository.find({ where: { shop: In(shopInstances) } });
    const productVariants = await this.productVariantRepository.find();
    const shopProductVariants = productVariants.map((variant) => variant.shop);
    const ignoreTestShopsInfo = shopInfos.filter(
      (shopInfo) => !isTestShop(shopInfo) && !shopProductVariants.includes(shopInfo.shop),
    );
    for (const shop of ignoreTestShopsInfo) {
      await Promise.all([this.syncProductFromWix(shop.shop), this.syncCollectionFromWix(shop.shop)]);
    }
    console.log('Sync all shop products done');
  }

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

  async handleSyncWixProduct(shop: string, product: IWixProduct): Promise<void> {
    const { id, productType, visible, name, brand, variants, media, sku, ribbon, collectionIds } = product;

    if (!id || !shop) return;
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
    await this.handleSyncWixProductCollection({ shop, productId: id, collectionIds });
  }

  async handleSyncWixProductCollection({
    shop,
    productId,
    collectionIds,
  }: {
    shop: string;
    productId: string;
    collectionIds: string[];
  }) {
    try {
      // Handle collection mapping
      if (collectionIds?.length) {
        // Get existing mappings
        const existingMappings = await this.collectionProductRepository.find({
          where: { shop, productId: productId },
        });

        // Remove mappings that are no longer valid
        const removedCollections = existingMappings.filter((mapping) => !collectionIds.includes(mapping.collectionId));
        if (removedCollections.length) {
          await this.collectionProductRepository.remove(removedCollections);
        }

        // Add new mappings
        const existingCollectionIds = existingMappings.map((mapping) => mapping.collectionId);
        const newCollections = collectionIds
          .filter((collectionId) => !existingCollectionIds.includes(collectionId))
          .map((collectionId) => ({
            shop,
            productId,
            collectionId,
          }));

        if (newCollections.length) {
          await this.collectionProductRepository.save(newCollections);
        }
      } else {
        // Remove all mappings if product no longer belongs to any collection
        await this.collectionProductRepository.delete({ shop, productId });
      }
    } catch (error) {
      console.log('error sync product collection', error);
    }
  }

  async handleSyncWixCollection(shop: string, collection: IWixCollection) {
    const { id, name, media, visible } = collection;
    if (!id || !shop) return;
    const collectionExist = await this.collectionRepository.findOne({ where: { shop, collection_id: id } });
    const collectionData = {
      id: collectionExist?.id,
      shop,
      collection_id: id,
      title: name,
      image: media?.mainMedia?.thumbnail?.url,
      active: visible,
    };
    const collectionInstance = this.collectionRepository.create(collectionData);
    try {
      await this.collectionRepository.save(collectionInstance);
    } catch (err) {
      console.log(err);
    }
  }

  @OnEvent(EventEmitterName.AppInstall)
  async createAttributeCronInstallApp(payload: IAppInstallEventPayload) {
    const { shop } = payload;
    if (!shop) return;
    const attributeCronExist = await this.attributeCronRepository.findOne({ where: { shop } });
    const cron = this.attributeCronRepository.create({
      shop,
      status: CronAttributeStatus.Pending,
      retry: 0,
      id: attributeCronExist?.id,
    });
    try {
      await this.attributeCronRepository.save(cron);
    } catch (err) {
      console.log(err.message);
    }
  }
}
