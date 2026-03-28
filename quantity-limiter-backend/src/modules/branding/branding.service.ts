import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitterName } from 'src/shared/common/types/shared.enum';
import { Repository } from 'typeorm';
import { ShopGeneral } from '../shop/entities/shop-general.entity';
import { CreateBrandingDto, GetBrandingDto, UpdateBrandingDto } from './dto/branding.dto';
import { Branding } from './entities/branding.entity';
import { CreateBrandingResponse, GetBrandingResponse, UpdateBrandingResponse } from './response/branding.response';
import { DisplayType, TextAlign } from './types/branding.enum';

@Injectable()
export class BrandingService {
  constructor(
    @InjectRepository(Branding)
    private readonly brandingRepository: Repository<Branding>,
    @InjectRepository(ShopGeneral)
    private readonly shopGeneralRepository: Repository<ShopGeneral>,
  ) {}

  @OnEvent(EventEmitterName.InitShopSettings)
  async createBrandingOnShopGeneralCreated(payload: { shop: string }): Promise<void> {
    const { shop } = payload;
    if (!shop) return;
    const existingBranding = await this.brandingRepository.findOne({
      where: { shop },
    });
    if (existingBranding) {
      return;
    }
    const branding = this.brandingRepository.create({
      shop,
      displayType: DisplayType.INLINE,
      backgroundColor: '#FFD466',
      textColor: '#4A4A4A',
      fontFamily: null,
      textAlign: TextAlign.LEFT,
      fontSize: 14,
      customCss: null,
    });
    try {
      await this.brandingRepository.save(branding);
    } catch (err) {
      console.log(`Error creating branding for shop: ${shop}. Error: ${err.message}`);
    }
  }

  async getBranding(payload: GetBrandingDto): Promise<GetBrandingResponse> {
    const { shop } = payload;
    const branding = await this.brandingRepository.findOne({
      where: { shop },
    });
    if (!branding) {
      throw new NotFoundException('Branding not found');
    }
    return {
      code: 200,
      status: 'success',
      data: branding,
    };
  }

  async createBranding(payload: CreateBrandingDto): Promise<CreateBrandingResponse> {
    const { shop, ...brandingData } = payload;
    const shopGeneral = await this.shopGeneralRepository.findOne({
      where: { shop },
    });
    if (!shopGeneral) {
      throw new NotFoundException('Shop not found');
    }
    const existingBranding = await this.brandingRepository.findOne({
      where: { shop },
    });
    if (existingBranding) {
      throw new BadRequestException('Branding already exists for this shop. Use update instead.');
    }
    const branding = this.brandingRepository.create({
      shop,
      displayType: brandingData.displayType || DisplayType.INLINE,
      backgroundColor: brandingData.backgroundColor || '#FFD466',
      textColor: brandingData.textColor || '#4A4A4A',
      fontFamily: brandingData.fontFamily || null,
      textAlign: brandingData.textAlign || TextAlign.LEFT,
      fontSize: brandingData.fontSize || 14,
      customCss: brandingData.customCss || null,
    });
    const savedBranding = await this.brandingRepository.save(branding);
    return {
      code: 200,
      status: 'success',
      data: savedBranding,
    };
  }

  async updateBranding(payload: GetBrandingDto & UpdateBrandingDto): Promise<UpdateBrandingResponse> {
    const { shop, ...updateData } = payload;
    const branding = await this.brandingRepository.findOne({
      where: { shop },
    });
    if (!branding) {
      throw new NotFoundException('Branding not found');
    }
    Object.assign(branding, updateData);
    const updatedBranding = await this.brandingRepository.save(branding);
    return {
      code: 200,
      status: 'success',
      data: updatedBranding,
    };
  }

  async deleteBranding(payload: GetBrandingDto): Promise<{ code: number; status: string; message: string }> {
    const { shop } = payload;
    const branding = await this.brandingRepository.findOne({
      where: { shop },
    });
    if (!branding) {
      throw new NotFoundException('Branding not found');
    }
    await this.brandingRepository.remove(branding);
    return {
      code: 200,
      status: 'success',
      message: 'Branding deleted successfully',
    };
  }
}
