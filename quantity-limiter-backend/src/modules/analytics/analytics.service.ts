import { BadRequestException, Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DefaultResponse } from 'src/docs/default/default-response.swagger';
import { AnalyticApiService } from 'src/shared/api/services/analytics-api.service';
import { Ga4Event } from 'src/shared/api/types/analytics-api/analytics-api.enum';
import { PricingPlan } from 'src/shared/api/types/wix-api/wix-api.enum';
import { safeJsonParseObject } from 'src/shared/common/utils/functions';
import { Between, Repository } from 'typeorm';
import { ShopGeneral } from '../shop/entities/shop-general.entity';
import {
  CreateAppOnboardingLogDto,
  GetOnboardingAnalyticsDto,
  LogTouchpointDto,
  SendGa4EventDto,
} from './dto/analytics.dto';
import { AppOnboardingLog } from './entities/analytics-onboarding-log.entity';
import { TouchpointsLog } from './entities/analytics-touchpoints-log.entity';
import {
  GeneralTouchpointResponse,
  OnboardingStatsResponse,
  StepCompletionStats,
  TemplatePreferenceCount,
  TouchpointStats,
  TouchpointStatsResponse,
  TypePreferenceCount,
  TypePreferenceStats,
} from './response/analytics.response';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly analyticApiService: AnalyticApiService,
    @InjectRepository(AppOnboardingLog)
    private readonly appOnboardingLogRepository: Repository<AppOnboardingLog>,
    @InjectRepository(TouchpointsLog)
    private readonly touchpointsLogRepository: Repository<TouchpointsLog>,
    @InjectRepository(ShopGeneral)
    private readonly shopGeneralRepository: Repository<ShopGeneral>,
  ) {}

  async sendGa4Event(payload: SendGa4EventDto): Promise<DefaultResponse> {
    const { event, shop, plan, type } = payload;
    if (event === Ga4Event.PricingDisplay) {
      this.analyticApiService.sendEventGa4(event, { shop_name: shop });
    } else if (event === Ga4Event.ChoosePlan) {
      this.analyticApiService.sendEventGa4(event, { shop_name: shop, plan, type });
    } else {
      this.analyticApiService.sendEventGa4(event, { shop_name: shop });
    }
    return { code: 200 };
  }

  async updateOnboardingStep(payload: CreateAppOnboardingLogDto): Promise<void> {
    const now = new Date();
    const { shop, current_step } = payload;
    await this.updatePreviousStep(payload, now);
    if (current_step > 6 || current_step < 1) throw new BadRequestException('Invalid step');
    if (current_step === 6) return await this.finishOnboarding(shop);

    const currentRecord = await this.appOnboardingLogRepository.findOne({
      where: { shop, step: current_step, finished_onboarding: false },
    });

    if (currentRecord)
      await this.appOnboardingLogRepository.update(
        { id: currentRecord.id },
        {
          start_time: now,
        },
      );
    else {
      await this.appOnboardingLogRepository.save({
        shop,
        step: current_step,
        start_time: now,
        finished_onboarding: false,
      });
    }
  }

  async finishOnboarding(shop: string): Promise<void> {
    await this.appOnboardingLogRepository.update({ shop }, { finished_onboarding: true });
  }

  async getStepCompletionStats(startDate: Date, endDate: Date, plan: PricingPlan): Promise<StepCompletionStats[]> {
    let shops: string[] = [];
    if (plan) {
      const shopGeneral = await this.shopGeneralRepository.find({ where: { plan } });
      shops = shopGeneral.map((shop) => shop.shop);
    }
    const queryBuilder = this.appOnboardingLogRepository
      .createQueryBuilder()
      .select('step')
      .addSelect('COUNT(*)', 'total_records')
      .where('end_time BETWEEN :startDate AND :endDate', { startDate, endDate });
    if (shops.length) {
      queryBuilder.andWhere('shop IN (:...shops)', { shops });
    }
    const rawResults = await queryBuilder.groupBy('step').getRawMany();
    const results: StepCompletionStats[] = rawResults.map((result) => ({
      ...result,
      total_records: Number(result.total_records),
    }));

    return results;
  }

  async getTypePreferenceStats(startDate: Date, endDate: Date, plan: PricingPlan): Promise<TypePreferenceStats> {
    let shops: string[] = [];
    if (plan) {
      const shopGeneral = await this.shopGeneralRepository.find({ where: { plan } });
      shops = shopGeneral.map((shop) => shop.shop);
    }

    const queryBuilder = this.appOnboardingLogRepository
      .createQueryBuilder()
      .select('shop')
      .addSelect('SUM(duration)', 'total_duration')
      .addSelect('MAX(type_preference)', 'type_preference')
      .addSelect('MAX(template_preference)', 'template_preference')
      .where('end_time BETWEEN :startDate AND :endDate', { startDate, endDate });

    if (shops.length > 0) {
      queryBuilder.andWhere('shop IN (:...shops)', { shops });
    }

    const records = await queryBuilder.groupBy('shop').getRawMany();

    // Count records based on type_preference
    const typePreferenceCount: TypePreferenceCount = records.reduce((acc, record) => {
      acc[record.type_preference] = (acc[record.type_preference] || 0) + 1;
      return acc;
    }, {});

    // Count records based on template_preference, filtered by type_preference
    const templatePreferenceCount: TemplatePreferenceCount = records.reduce((acc, record) => {
      const key = `${record.type_preference}_${record.template_preference}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return { typePreferenceCount, templatePreferenceCount };
  }

  async getOnboardingStats(getOnboardingAnalytics: GetOnboardingAnalyticsDto): Promise<OnboardingStatsResponse> {
    const startDate = new Date(getOnboardingAnalytics.startDate);
    const endDate = new Date(getOnboardingAnalytics.endDate);
    const stepCompletionStats = await this.getStepCompletionStats(startDate, endDate, getOnboardingAnalytics.plan);
    return {
      stepCompletionStats,
      code: 200,
    };
  }

  async updatePreviousStep(payload: CreateAppOnboardingLogDto, now: Date): Promise<void> {
    const { shop } = payload;

    const previousStepRecord = await this.appOnboardingLogRepository
      .createQueryBuilder()
      .where('start_time > end_time')
      .orWhere('end_time IS NULL')
      .andWhere('shop = :shop', { shop })
      .getOne();

    if (previousStepRecord) {
      previousStepRecord.end_time = now;
      await this.appOnboardingLogRepository.save(previousStepRecord);
    }
  }

  async logTouchpoint(payload: LogTouchpointDto): Promise<DefaultResponse> {
    const { touchpoint } = payload;
    const today = new Date().toISOString().split('T')[0];
    const existingLog = await this.touchpointsLogRepository.findOne({ where: { createdDate: today } });
    const generalTouchpoint: GeneralTouchpointResponse = {
      pricing_plan: 0,
      home_top_banner: 0,
      checklist_estimate_rule_limit: 0,
      checklist_show_in_cart: 0,
      checklist_auto_detect_location: 0,
      settings_top_banner: 0,
      setup_show_in_cart: 0,
      setup_out_of_stock: 0,
      appearance_change_icon: 0,
      appearance_visual_editor: 0,
      custom_css: 0,
      upgrade_ETA_checkout: 0,
    };
    const dataExitLog = safeJsonParseObject(existingLog?.generalTouchpoint);
    for (const key in dataExitLog) {
      if (key === 'checklist_general_rule_limit') {
        generalTouchpoint.checklist_estimate_rule_limit += dataExitLog[key];
      }
      if (key in generalTouchpoint) {
        generalTouchpoint[key] += dataExitLog[key];
      }
    }
    if (touchpoint in generalTouchpoint) {
      generalTouchpoint[touchpoint] += 1;
    }
    const instance = this.touchpointsLogRepository.create({
      id: existingLog?.id,
      generalTouchpoint: JSON.stringify(generalTouchpoint),
    });
    await this.touchpointsLogRepository.save(instance);
    return { code: 200, status: 'success' };
  }

  async getTouchpointsLog(query: GetOnboardingAnalyticsDto): Promise<TouchpointStatsResponse> {
    const { startDate, endDate } = query;
    try {
      const touchPointsObject: TouchpointStats = {
        pricing_plan: { click: 0, percentage: 0 },
        home_top_banner: { click: 0, percentage: 0 },
        checklist_estimate_rule_limit: { click: 0, percentage: 0 },
        checklist_show_in_cart: { click: 0, percentage: 0 },
        checklist_auto_detect_location: { click: 0, percentage: 0 },
        settings_top_banner: { click: 0, percentage: 0 },
        setup_show_in_cart: { click: 0, percentage: 0 },
        setup_out_of_stock: { click: 0, percentage: 0 },
        appearance_change_icon: { click: 0, percentage: 0 },
        appearance_visual_editor: { click: 0, percentage: 0 },
        custom_css: { click: 0, percentage: 0 },
        upgrade_ETA_checkout: { click: 0, percentage: 0 },
      };

      const touchpoints = await this.touchpointsLogRepository.find({
        where: { createdDate: Between(startDate, endDate) },
      });

      for (const log of touchpoints) {
        const logObject = JSON.parse(log.generalTouchpoint);
        for (const key in logObject) {
          if (key === 'checklist_general_rule_limit') {
            touchPointsObject.checklist_estimate_rule_limit.click += logObject[key];
          }
          if (touchPointsObject[key]) {
            touchPointsObject[key].click += logObject[key];
          }
        }
      }
      const totalClicks = Object.values(touchPointsObject).reduce((acc, touchpoint) => acc + touchpoint.click, 0);
      for (const key in touchPointsObject) {
        if (totalClicks > 0) {
          touchPointsObject[key].percentage = (touchPointsObject[key].click / totalClicks) * 100;
        }
      }
      return {
        code: 200,
        status: 'success',
        data: touchPointsObject,
      };
    } catch (err) {
      throw new UnprocessableEntityException(err.message);
    }
  }
}
