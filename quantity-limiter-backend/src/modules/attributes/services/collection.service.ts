import { Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { IWixCollection } from 'src/modules/wix/types/wix.interface';
import { WixApiService } from 'src/shared/api/services/wix-api.service';
import { EventEmitterName } from 'src/shared/common/types/shared.enum';
import { formatMetaResponse, formatPaginationRequest } from 'src/shared/common/utils/functions';
import { FindManyOptions, FindOneOptions, FindOptionsWhere, In, Like, Repository } from 'typeorm';
import { GetCollectionsDto } from '../dto/collection.dto';
import { Collection } from '../entities/collection/collection.entity';
import { GetCollectionsResponse } from '../response/collection.response';
import { ICollectionRemove, ICollectionUpdate } from '../types/attributes.interface';

@Injectable()
export class CollectionService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    @InjectRepository(Collection)
    private readonly collectionRepository: Repository<Collection>,
    private readonly wixApiService: WixApiService,
  ) {}

  async getCollections(payload: GetCollectionsDto): Promise<GetCollectionsResponse> {
    const { shop, page, perPage, name, includeCollectionIds } = payload;
    const { skip, take } = formatPaginationRequest(page, perPage);
    const where: FindOptionsWhere<Collection> = { shop };
    if (name) where.title = Like(`%${name}%`);
    const [collections, total] = await this.collectionRepository.findAndCount({
      where,
      skip,
      take,
    });
    let totalCollecitons: number;
    if (includeCollectionIds) {
      const includeCollections = await this.collectionRepository.find({
        where: { shop, collection_id: In(includeCollectionIds.split(',')) },
      });
      const existingCollectionIds = new Set(collections.map((collection) => collection.collection_id));
      const filteredIncludeCollections = includeCollections.filter(
        (collection) => !existingCollectionIds.has(collection.collection_id),
      );
      collections.push(...filteredIncludeCollections);
      totalCollecitons = total + filteredIncludeCollections.length;
    }
    return {
      code: 200,
      status: 'success',
      data: collections,
      meta: formatMetaResponse(page, perPage, totalCollecitons || total, collections.length),
    };
  }

  async findOneCollection(options: FindOneOptions<Collection>): Promise<Collection> {
    return await this.collectionRepository.findOne(options);
  }

  async findCollections(options: FindManyOptions<Collection>): Promise<Collection[]> {
    return await this.collectionRepository.find(options);
  }

  @OnEvent(EventEmitterName.CollectionUpdate)
  async upsertShopCustomCollection(payload: ICollectionUpdate): Promise<void> {
    const { shop, collectionId } = payload;
    const collectionExist = await this.collectionRepository.findOne({
      where: { shop, collection_id: String(collectionId) },
    });

    setTimeout(async () => {
      const wixCollection: IWixCollection = await this.wixApiService.getCollectionByIdV1(shop, collectionId);
      if (!wixCollection) return;
      const collectionInstance = this.collectionRepository.create({
        id: collectionExist?.id,
        shop,
        active: wixCollection.visible,
        title: wixCollection.name,
        collection_id: String(collectionId),
        image: wixCollection?.media?.mainMedia?.thumbnail?.url,
      });
      try {
        await this.collectionRepository.save(collectionInstance);
      } catch (err) {
        if (!err.message.includes('Duplicate')) console.log(err);
      }
    }, 5000);
  }

  @OnEvent(EventEmitterName.DataRemove)
  async removeCollectionData(payload: { shop: string }): Promise<void> {
    if (!payload.shop) return;
    try {
      await this.collectionRepository.delete({ shop: payload.shop });
    } catch (err) {
      console.log('removeCollectionData', err.message);
    }
  }

  @OnEvent(EventEmitterName.CollectionRemove)
  async handleShopifyProductRemoved(payload: ICollectionRemove): Promise<void> {
    const { shop } = payload;
    const collection_id = String(payload.id);
    const deletedProduct = await this.collectionRepository.findOne({ where: { shop, collection_id } });
    if (!deletedProduct) return;
    await this.collectionRepository.delete({ shop, collection_id });
  }
}
