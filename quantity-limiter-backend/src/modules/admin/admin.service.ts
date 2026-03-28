import { Injectable, NotFoundException } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { PlanSubscription, PricingPlan } from 'src/shared/api/types/wix-api/wix-api.enum';
import { EventEmitterName } from 'src/shared/common/types/shared.enum';
import {
  formatDateString,
  formatMetaResponse,
  formatPaginationRequest,
  generateHmacKey,
  isTestShop,
  unixTimestamp,
  unixTimestampToDate,
} from 'src/shared/common/utils/functions';
import { Between, FindOptionsWhere, In, Like, Not, Repository } from 'typeorm';
import { AppOnboardingLog } from '../analytics/entities/analytics-onboarding-log.entity';
import { ShopGeneral } from '../shop/entities/shop-general.entity';
import { ShopInfo } from '../shop/entities/shop-info.entity';
import { ShopInstalled } from '../shop/entities/shop-installed.entity';
import { IWixShopData } from '../wix/types/wix.interface';
import {
  AdminDashboardGroupPlanDto,
  CreateAppPerformanceLogDto,
  GetAdminDailyUninstallLogDto,
  GetDashboardSummaryDto,
  SearchUsersAdminDto,
  UpdateShopPlanDto,
} from './dto/admin.dto';
import { AdminDailyLog } from './entities/admin-daily-log.entity';
import { AdminDailyUninstallLog } from './entities/admin-daily-uninstall-log.entity';
import { AppPerformanceLog } from './entities/admin-performance-log.entity';
import {
  AdminSummaryResponse,
  CountryNameResponse,
  CreateAppPerformanceLogResponse,
  DashboardActivePlan,
  DashboardGroupPlanResponse,
  DataTransferResponse,
  FeatureUsageResponse,
  GetAdminDailyUninstallLogResponse,
  GetAppPerformanceLogResponse,
  ResultAdminDailyUninstallLog,
  SearchUsersAdminResponse,
  UserInfoResponse,
  UserResponse,
} from './response/admin.response';
import { DashboardGroupPlanBy, UpdateReportAction } from './types/admin.enum';
import { IShopOnboardingRecord, IUpdateDailyAnalytic } from './types/admin.interface';
@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(AdminDailyLog)
    private readonly adminDailyLogRepository: Repository<AdminDailyLog>,
    @InjectRepository(AppPerformanceLog)
    private readonly appPerformanceLogRepository: Repository<AppPerformanceLog>,
    @InjectRepository(AppOnboardingLog)
    private readonly appOnboardingLogRepository: Repository<AppOnboardingLog>,
    @InjectRepository(ShopInfo)
    private readonly shopInfoRepository: Repository<ShopInfo>,
    @InjectRepository(ShopGeneral)
    private readonly shopGeneralRepository: Repository<ShopGeneral>,
    @InjectRepository(ShopInstalled)
    private readonly shopInstalledRepository: Repository<ShopInstalled>,
    @InjectRepository(AdminDailyUninstallLog)
    private readonly adminDailyUninstallLogRepository: Repository<AdminDailyUninstallLog>,
  ) {}

  async createAppPerformanceLog(payload: CreateAppPerformanceLogDto): Promise<CreateAppPerformanceLogResponse> {
    const appPerformanceLog: AppPerformanceLog = await this.appPerformanceLogRepository.save(payload);
    return {
      code: 200,
      data: {
        appPerformanceLog,
      },
    };
  }

  async getAppPerformanceLogs(payload: GetDashboardSummaryDto): Promise<GetAppPerformanceLogResponse> {
    const startDate = new Date(payload.startDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(payload.endDate);
    endDate.setHours(0, 0, 0, 0);
    const startYear = startDate.getFullYear();
    const startMonth = startDate.getMonth();
    const startDay = startDate.getDate();
    const endYear = endDate.getFullYear();
    const endMonth = endDate.getMonth();
    const endDay = endDate.getDate();
    const appPerformanceLogs = await this.appPerformanceLogRepository.find({
      where: { created_at: Between(new Date(startYear, startMonth, startDay), new Date(endYear, endMonth, endDay)) },
      order: { created_at: 'ASC' },
    });
    return {
      code: 200,
      data: appPerformanceLogs,
    };
  }

  async getDashboardSummary(payload: GetDashboardSummaryDto): Promise<AdminSummaryResponse> {
    const { startDate, endDate, plan } = payload;
    const start = new Date(startDate);
    const end = new Date(endDate);

    const shopInstalls = await this.shopInstalledRepository.find({
      where: [{ uninstalled: false, closeStore: false }, { lastInstalledDate: Between(start, end) }],
    });

    const shopNames = shopInstalls.map((shop) => shop.shop);
    const shopInfos = await this.shopInfoRepository.find({ where: { shop: In(shopNames) } });
    const ignoreTestShopsInfo = shopInfos.filter((shopInfo) => !isTestShop(shopInfo));
    const ignoreTestShops = ignoreTestShopsInfo.map((shopInfo) => shopInfo.shop);

    const activeShops = shopInstalls
      .filter((shopInstall) => ignoreTestShops.includes(shopInstall.shop) && !shopInstall.uninstalled)
      .map((shopInstall) => shopInstall.shop);

    const ignoreTestShopsGeneral = await this.shopGeneralRepository.find({ where: { shop: In(ignoreTestShops) } });
    const ignoreTestShopsGeneralActive = ignoreTestShopsGeneral.filter((shop) => activeShops.includes(shop.shop));

    let filteredShopInstalls = shopInstalls.filter(
      (shopInstall) =>
        ignoreTestShops.includes(shopInstall.shop) &&
        shopInstall.lastInstalledDate >= start &&
        shopInstall.lastInstalledDate <= end,
    );
    let ignoreTestShopsGeneralPlanUpdate = [];
    if (plan) {
      const shopsGeneralInPlan = ignoreTestShopsGeneral.filter((shop) => shop.plan === plan);
      const shopsInPlan = shopsGeneralInPlan.map((shop) => shop.shop);
      filteredShopInstalls = shopInstalls.filter(
        (shopInstall) =>
          shopsInPlan.includes(shopInstall.shop) &&
          shopInstall.lastInstalledDate >= start &&
          shopInstall.lastInstalledDate <= end,
      );
      const startTimestamp = unixTimestamp(startDate);
      const endTimestamp = unixTimestamp(endDate);
      ignoreTestShopsGeneralPlanUpdate = ignoreTestShopsGeneralActive.filter(
        (shop) => shop.planUpdatedAt >= startTimestamp && shop.planUpdatedAt <= endTimestamp,
      );
    }
    const countShopInstalledActive = filteredShopInstalls.filter(
      (shopInstall) =>
        ignoreTestShops.includes(shopInstall.shop) && !shopInstall.uninstalled && !shopInstall.closeStore,
    ).length;
    const totalInstalledUser = filteredShopInstalls.length;
    const shopInfosWithSubcriptionPlan = ignoreTestShopsInfo
      .filter((shopInfo) => activeShops.includes(shopInfo.shop))
      .map((shopInfo) => {
        const matchShopGeneral = ignoreTestShopsGeneralActive.find((shopGeneral) => shopGeneral.shop === shopInfo.shop);
        return {
          ...shopInfo,
          subscription: matchShopGeneral?.subscription,
          plan: matchShopGeneral?.plan,
        };
      });

    const [summaryData, featureUsage, topCountryAndShopifyPlan, dataTransfer, paidByCountry, shopCategory] =
      await Promise.all([
        this.getDashboardUserSummary(payload, ignoreTestShopsGeneralActive),
        this.countFeaturesUsage(payload, ignoreTestShopsGeneralActive),
        this.getTopCountryAndShopifyPlan(payload, shopInfosWithSubcriptionPlan),
        this.getTransferData(payload, ignoreTestShopsGeneralPlanUpdate),
        this.getPaidByCountry(end),
        this.getShopCategory(end),
      ]);

    return {
      code: 200,
      data: {
        summaryData,
        featureUsage,
        topCountry: topCountryAndShopifyPlan.topCountry,
        dataTransfer,
        retentionRate: (countShopInstalledActive / totalInstalledUser || 0).toFixed(4),
        paidByCountry,
        shopCategory,
      },
    };
  }

  async getPaidByCountry(endDate: Date) {
    const paidByCountry = await this.shopGeneralRepository
      .createQueryBuilder('shopGeneral')
      .select('shopInfo.country', 'country')
      .addSelect('COUNT(shopInfo.country)', 'count')
      .leftJoin(ShopInfo, 'shopInfo', 'shopInfo.shop = shopGeneral.shop')
      .leftJoin(ShopInstalled, 'shopInstalled', 'shopInstalled.shop = shopGeneral.shop')
      .where('plan IN (:...plans)', { plans: [PricingPlan.Standard, PricingPlan.Pro, PricingPlan.Plus] })
      .andWhere('shopInstalled.uninstalled = false')
      .andWhere('shopInstalled.closeStore = false')
      .andWhere('shopInstalled.lastInstalledDate <= :endDate', { endDate })
      .groupBy('shopInfo.country')
      .getRawMany();
    return paidByCountry;
  }

  async getShopCategory(endDate: Date) {
    const shopCategory = await this.shopInfoRepository
      .createQueryBuilder('shopInfo')
      .select('shopInfo.category', 'category')
      .addSelect('COUNT(shopInfo.category)', 'count')
      .leftJoin(ShopInstalled, 'shopInstalled', 'shopInstalled.shop = shopInfo.shop')
      .where('shopInstalled.uninstalled = false')
      .andWhere('shopInstalled.closeStore = false')
      .andWhere('shopInstalled.lastInstalledDate <= :endDate', { endDate })
      .groupBy('shopInfo.category')
      .getRawMany();
    return shopCategory;
  }

  async getTransferData(payload: GetDashboardSummaryDto, shopsGeneral: ShopGeneral[]): Promise<DataTransferResponse> {
    const { plan } = payload;
    if (!plan) return;
    const dataTransfer: DataTransferResponse = { upgrade: 0, downgrade: 0 };
    const filterShops = (currentPlan: PricingPlan, oldPlan: PricingPlan) =>
      shopsGeneral.filter((shop) => shop.plan === currentPlan && shop.oldPlan === oldPlan).length;
    switch (plan) {
      case PricingPlan.Free:
        dataTransfer.upgrade =
          filterShops(PricingPlan.Standard, PricingPlan.Free) + filterShops(PricingPlan.Pro, PricingPlan.Free);
        break;
      case PricingPlan.Standard:
        dataTransfer.upgrade = filterShops(PricingPlan.Pro, PricingPlan.Standard);
        dataTransfer.downgrade = filterShops(PricingPlan.Standard, PricingPlan.Pro);
        break;
      case PricingPlan.Pro:
        dataTransfer.downgrade =
          filterShops(PricingPlan.Standard, PricingPlan.Pro) + filterShops(PricingPlan.Free, PricingPlan.Pro);
        break;
    }
    return dataTransfer;
  }

  async getDashboardUserSummary(
    payload: GetDashboardSummaryDto,
    shopsGeneral: ShopGeneral[],
  ): Promise<AdminDailyLog[]> {
    const startDate = new Date(payload.startDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(payload.endDate);
    endDate.setHours(0, 0, 0, 0);
    const startYear = startDate.getFullYear();
    const startMonth = startDate.getMonth();
    const startDay = startDate.getDate();
    const endYear = endDate.getFullYear();
    const endMonth = endDate.getMonth();
    const endDay = endDate.getDate();
    const adminDailyLog = await this.adminDailyLogRepository.find({
      where: { createdDate: Between(new Date(startYear, startMonth, startDay), new Date(endYear, endMonth, endDay)) },
      order: { createdDate: 'ASC' },
    });
    const defaultSummary: Partial<AdminDailyLog> = {
      installedUser: 0,
      planDetail: { basic: 0, standard: 0, pro: 0, plus: 0 },
      totalUser: 0,
      uninstalledUser: 0,
      uninstallInDay: 0,
      upgradePlanInDay: 0,
      upgradeUser: 0,
      paidUninstall: 0,
      closeStore: 0,
    };
    const summaryData: AdminDailyLog[] = [];
    const currentDateString = formatDateString();
    while (startDate <= endDate) {
      const datestring = formatDateString(startDate);
      if (datestring === currentDateString) {
        const currentDateSummary = await this.getDateAnalytic(new Date(), shopsGeneral);
        const summary = this.adminDailyLogRepository.create({ ...defaultSummary, ...currentDateSummary });
        summary.createdDate = datestring;
        summaryData.push(summary);
        break;
      } else {
        const matchSummary = adminDailyLog.find((log) => log.createdDate === datestring);
        const summary = this.adminDailyLogRepository.create(matchSummary || defaultSummary);
        if (!summary.createdDate) summary.createdDate = datestring;
        summaryData.push(summary);
        startDate.setDate(startDate.getDate() + 1);
      }
    }
    return summaryData;
  }

  async getDashboardActivePlan(payload: AdminDashboardGroupPlanDto): Promise<DashboardGroupPlanResponse> {
    const { year, plan } = payload;
    const groupBy = payload.groupBy || DashboardGroupPlanBy.MONTHLY;
    const startYear = new Date(Number(year), 0, 1, 0, 0, 0, 0);
    const endYear = new Date(Number(year), 11, 31, 23, 59, 59, 999);
    const startTime = unixTimestamp(startYear);
    const endTime = unixTimestamp(endYear);
    const shops: ShopGeneral[] = await this.shopGeneralRepository.find({
      where: { planUpdatedAt: Between(startTime, endTime), plan },
      cache: 6 * 60 * 60 * 1000,
    });
    const shopInstalls = await this.shopInstalledRepository.find({
      where: { shop: In(shops.map((shop) => shop.shop)) },
    });
    const installGroup: Record<string, Record<PlanSubscription, DashboardActivePlan>> = {};
    const uninstallGroup: Record<string, Record<PlanSubscription, DashboardActivePlan>> = {};
    const downgradeGroup: Record<string, DashboardActivePlan> = {};
    if (groupBy === DashboardGroupPlanBy.MONTHLY) {
      for (let month = 1; month <= 12; month++) {
        const key = `${month}/${year}`;
        installGroup[key] = {
          monthly: { basic: 0, standard: 0, pro: 0, plus: 0 },
          yearly: { basic: 0, standard: 0, pro: 0, plus: 0 },
        };
        uninstallGroup[key] = {
          monthly: { basic: 0, standard: 0, pro: 0, plus: 0 },
          yearly: { basic: 0, standard: 0, pro: 0, plus: 0 },
        };
        downgradeGroup[key] = { basic: 0, standard: 0, pro: 0, plus: 0 };
      }
    } else if (groupBy === DashboardGroupPlanBy.QUARTER) {
      for (let quarter = 1; quarter <= 4; quarter++) {
        const key = `Q${quarter}/${year}`;
        installGroup[key] = {
          monthly: { basic: 0, standard: 0, pro: 0, plus: 0 },
          yearly: { basic: 0, standard: 0, pro: 0, plus: 0 },
        };
        uninstallGroup[key] = {
          monthly: { basic: 0, standard: 0, pro: 0, plus: 0 },
          yearly: { basic: 0, standard: 0, pro: 0, plus: 0 },
        };
        downgradeGroup[key] = { basic: 0, standard: 0, pro: 0, plus: 0 };
      }
    }
    shops.forEach((shop) => {
      const { plan, planUpdatedAt } = shop;
      const subscription = shop.subscription?.toLowerCase();
      const shopInstall = shopInstalls.find((shopInstall) => shopInstall.shop === shop.shop);
      const month = unixTimestampToDate(planUpdatedAt).getMonth() + 1;
      let key: string;
      if (groupBy === DashboardGroupPlanBy.QUARTER) {
        let quarter: number;
        if (month <= 3) quarter = 1;
        else if (month <= 6) quarter = 2;
        else if (month <= 9) quarter = 3;
        else quarter = 4;
        key = `Q${quarter}/${year}`;
      } else key = `${month}/${year}`;
      if (shopInstall?.closeStore) {
        if (plan === PricingPlan.Free) downgradeGroup[key].basic += 1;
        else if (plan === PricingPlan.Standard) downgradeGroup[key].standard += 1;
        else if (plan === PricingPlan.Pro) downgradeGroup[key].pro += 1;
        else if (plan === PricingPlan.Plus) downgradeGroup[key].plus += 1;
      } else if (shopInstall?.uninstalled) {
        if (plan === PricingPlan.Free) uninstallGroup[key][subscription].basic += 1;
        else if (plan === PricingPlan.Standard) uninstallGroup[key][subscription].standard += 1;
        else if (plan === PricingPlan.Pro) uninstallGroup[key][subscription].pro += 1;
        else if (plan === PricingPlan.Plus) uninstallGroup[key][subscription].plus += 1;
      } else {
        // if (downgrade) {
        //   if (oldPlan === ShopPlan.BASIC) downgradeGroup[key].basic += 1;
        //   else if (oldPlan === ShopPlan.PRO) downgradeGroup[key].pro += 1;
        //   else if (oldPlan === ShopPlan.PREMIUM) downgradeGroup[key].premium += 1;
        //   else if (oldPlan === ShopPlan.UNLIMITED) downgradeGroup[key].unlimited += 1;
        // }
        if (plan === PricingPlan.Free) installGroup[key][subscription].basic += 1;
        else if (plan === PricingPlan.Standard) installGroup[key][subscription].standard += 1;
        else if (plan === PricingPlan.Pro) installGroup[key][subscription].pro += 1;
        else if (plan === PricingPlan.Plus) installGroup[key][subscription].plus += 1;
      }
    });
    const categories: string[] = [];
    const monthlySeries: DashboardActivePlan[] = [];
    const annuallySeries: DashboardActivePlan[] = [];
    const uninstallMonthlySeries: DashboardActivePlan[] = [];
    const uninstallAnnuallySeries: DashboardActivePlan[] = [];
    const downgradeSeries: DashboardActivePlan[] = [];
    Object.keys(installGroup).forEach((key) => {
      categories.push(key);
      monthlySeries.push(installGroup[key].monthly);
      annuallySeries.push(installGroup[key].yearly);
    });
    Object.keys(uninstallGroup).forEach((key) => {
      uninstallMonthlySeries.push(uninstallGroup[key].monthly);
      uninstallAnnuallySeries.push(uninstallGroup[key].yearly);
    });
    Object.keys(downgradeGroup).forEach((key) => {
      downgradeSeries.push(downgradeGroup[key]);
    });
    return {
      code: 200,
      data: {
        categories,
        monthlySeries,
        annuallySeries,
        uninstallMonthlySeries,
        uninstallAnnuallySeries,
        downgradeSeries,
      },
    };
  }

  async countFeaturesUsage(payload: GetDashboardSummaryDto, shopsGeneral: ShopGeneral[]): Promise<any> {
    const featureUsage: FeatureUsageResponse = {
      ruleAndConditionQuantity: {
        rule: {
          zero: 0,
          one: 0,
          two: 0,
          three: 0,
          greaterThanFour: 0,
        },
        condition: {
          zero: 0,
          one: 0,
          two: 0,
          three: 0,
          greaterThanFour: 0,
        },
        languageRule: {
          zero: 0,
          one: 0,
          two: 0,
          three: 0,
          greaterThanFour: 0,
        },
      },
      conditionsUsage: {
        includeProducts: 0,
        includeCollections: 0,
        includeBrands: 0,
        includeSKUs: 0,
        excludeProducts: 0,
        excludeCollections: 0,
        excludeBrands: 0,
        excludeSKUs: 0,
        exceptionProducts: 0,
        country: 0,
        zipCode: 0,
        stateProvince: 0,
      },
      autoDetectPostalCountry: 0,
      postalCodeRequired: 0,
      customCss: 0,
      showOnCart: 0,
      showOnCollection: 0,
      showOnHome: 0,
      showOnPage: 0,
      showOnProduct: 0,
      shopShowInCart: 0,
      shopEnabledSoldOut: 0,
      shopCustomTimelineIcon: 0,
      shopUseCheckoutFeature: 0,
      shopUsingLanguageRule: 0,
    };
    const CACHE_TIME = 60 * 60 * 1000;
    const shopNameGeneral = [];
    if (payload.plan) shopsGeneral = shopsGeneral.filter((shop) => shop.plan === payload.plan);
    shopsGeneral.forEach((shopGeneral) => {
      const { shop } = shopGeneral;
      shopNameGeneral.push(shop);

      // if (customCss) featureUsage.customCss++;
    });
  }

  async getTopCountryAndShopifyPlan(
    payload: GetDashboardSummaryDto,
    shopsInfo: (ShopInfo & { subscription: string; plan: PricingPlan })[],
  ): Promise<{ topCountry: CountryNameResponse[] }> {
    if (payload.plan) shopsInfo = shopsInfo.filter((shopInfo) => shopInfo.plan === payload.plan);
    const groupShop: {
      country: { [key: string]: CountryNameResponse };
    } = shopsInfo.reduce(
      (result, shopInfo) => {
        const { country } = shopInfo;
        if (country) {
          if (!result.country[country]) result.country[country] = { name: country, value: 1 };
          else result.country[country].value += 1;
        }
        return result;
      },
      { country: {} },
    );

    const topCountry = Object.values(groupShop.country)
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
    return { topCountry };
  }

  async getDateAnalytic(date: Date, activeUsers: ShopGeneral[]): Promise<AdminDailyLog> {
    const now = new Date(date);
    const year = now.getFullYear();
    const month = now.getMonth();
    const day = now.getDate();
    const logExist = await this.adminDailyLogRepository.findOne({
      where: { createdDate: new Date(year, month, day) },
    });
    const dailyLog = this.adminDailyLogRepository.create(logExist);
    if (!dailyLog.createdDate) dailyLog.createdDate = now;
    dailyLog.planDetail = { basic: 0, standard: 0, pro: 0, plus: 0 };
    dailyLog.totalUser = activeUsers.length;
    activeUsers.forEach((user) => {
      if (user.plan === PricingPlan.Free) dailyLog.planDetail.basic += 1;
      else if (user.plan === PricingPlan.Pro) dailyLog.planDetail.pro += 1;
      else if (user.plan === PricingPlan.Standard) dailyLog.planDetail.standard += 1;
      else if (user.plan === PricingPlan.Plus) dailyLog.planDetail.plus += 1;
    });
    return dailyLog;
  }

  async searchUsersAdmin(payload: SearchUsersAdminDto): Promise<SearchUsersAdminResponse> {
    const { search, page, perPage, plan, sortUninstallAfter, sortLastAccess } = payload;
    const { skip, take } = formatPaginationRequest(page, perPage);
    const where: FindOptionsWhere<ShopGeneral> = {};
    let shopInfos: ShopInfo[];
    if (search) {
      shopInfos = await this.shopInfoRepository.find({
        where: [
          { name: Like(`%${search.trim()}%`) },
          { email: Like(`%${search.trim()}%`) },
          { phone: Like(`%${search.trim()}%`) },
          { shop: Like(`%${search.trim()}%`) },
        ],
      });
      const shopInfosName = shopInfos.map((shopInfo) => shopInfo.shop);
      where.shop = In(shopInfosName);
    } else {
      shopInfos = await this.shopInfoRepository.find({
        where: { email: Not(Like('%@avada.com%')) },
      });
      const shopInfosName = shopInfos.map((shopInfo) => shopInfo.shop);
      where.shop = In(shopInfosName);
    }
    if (plan) where.plan = plan;
    const [shopGenerals, total] = await this.shopGeneralRepository.findAndCount({
      where,
      take,
      skip,
      order: { planUpdatedAt: 'DESC', id: 'DESC', lastAccess: sortLastAccess },
    });
    const shopGeneralsName = shopGenerals.map(({ shop }) => shop);
    const shopsInstalled = await this.shopInstalledRepository.find({
      where: { shop: In(shopGeneralsName) },
      order: { dateUninstalled: sortUninstallAfter },
    });
    if (!shopInfos) {
      shopInfos = await this.shopInfoRepository.find({
        where: { shop: In(shopGeneralsName) },
      });
    }

    const maximumStepPerShopRecords = await this.getMaximumStepPerShop();

    const usersResponse: UserResponse[] = await Promise.all(
      shopGenerals.map(async (shopGeneral) => {
        const matchInstalled = shopsInstalled.find((shopInstall) => shopInstall.shop === shopGeneral.shop);
        const lastAccess = shopGeneral.lastAccess ? new Date(shopGeneral.lastAccess * 1000) : undefined;
        const firstInstallDate = matchInstalled ? new Date(matchInstalled.dateInstalled) : undefined;
        const lastInstallDate = matchInstalled ? new Date(matchInstalled.lastInstalledDate) : undefined;
        const isUninstall = !!matchInstalled?.uninstalled;
        const uninstalledDate = isUninstall && matchInstalled ? new Date(matchInstalled.dateUninstalled) : undefined;
        const matchShopInfo = shopInfos.find((shopInfo) => shopInfo.shop === shopGeneral.shop);
        const email = matchShopInfo?.email;
        const country = matchShopInfo?.country;
        const phone = matchShopInfo?.phone;
        const hasNotUninstall: boolean = matchInstalled && !matchInstalled.dateUninstalled;
        const hasReinstalled: boolean =
          matchInstalled && matchInstalled.lastInstalledDate > matchInstalled.dateUninstalled;
        const appUsageDurationOfUninstalledShop =
          matchInstalled && !hasNotUninstall && !hasReinstalled
            ? Math.abs(matchInstalled.dateUninstalled.getTime() - matchInstalled.lastInstalledDate.getTime())
            : null;

        const shopOnboardingRecord: IShopOnboardingRecord = maximumStepPerShopRecords.find(
          (item: IShopOnboardingRecord) => item.shop === shopGeneral.shop,
        );

        const userResponse: UserResponse = {
          id: shopGeneral.id,
          shop: shopGeneral.shop,
          plan: shopGeneral.plan,
          subscription: shopGeneral.subscription,
          firstInstallDate,
          lastInstallDate,
          note: matchInstalled.note,
          isUninstall,
          uninstalledDate,
          appUsageDurationOfUninstalledShop,
          otherUrl: matchShopInfo?.siteUrl,
          lastAccess,
          contact: {
            email,
            country,
            phone,
          },
          enableApp: !!shopGeneral.enableApp,
          latestOnboardingStep: shopOnboardingRecord ? shopOnboardingRecord.maxStep : null,
        };
        return userResponse;
      }),
    );

    return {
      code: 200,
      data: usersResponse,
      meta: formatMetaResponse(page, perPage, total, shopGenerals.length),
    };
  }

  async getMaximumStepPerShop(): Promise<IShopOnboardingRecord[]> {
    return await this.appOnboardingLogRepository
      .createQueryBuilder('log')
      .select('log.shop', 'shop')
      .addSelect('MAX(log.step)', 'maxStep')
      .groupBy('log.shop')
      .getRawMany();
  }

  async getUserInfo(id: number): Promise<UserInfoResponse> {
    const shopGeneral = await this.shopGeneralRepository.findOne({ where: { id } });
    if (!shopGeneral) throw new NotFoundException('Shop not found');
    const shopInfo = await this.shopInfoRepository.findOne({ where: { shop: shopGeneral.shop } });
    let shopJson: IWixShopData;
    try {
      shopJson = JSON.parse(shopInfo.shopJson);
    } catch (err) {}
    return {
      code: 200,
      data: {
        shopGeneral,
        shopifyInfo: shopJson,
      },
    };
  }

  @OnEvent(EventEmitterName.ReportUpdate)
  async updateShopReport(payload: IUpdateDailyAnalytic) {
    const { date, shop, action } = payload;
    const shopInfo = await this.shopInfoRepository.findOne({ where: { shop } });
    if (isTestShop(shopInfo)) return;
    const reportDate = new Date(date);
    const year = reportDate.getFullYear();
    const month = reportDate.getMonth();
    const day = reportDate.getDate();
    const reportExist = await this.adminDailyLogRepository.findOne({
      where: { createdDate: new Date(year, month, day) },
    });
    const report = this.adminDailyLogRepository.create(reportExist);
    if (!report.createdDate) report.createdDate = reportDate;
    if (action === UpdateReportAction.INSTALL) {
      if (!report.installedUser) report.installedUser = 1;
      else report.installedUser += 1;
    } else if (action === UpdateReportAction.UNINSTALL) {
      const dateString = formatDateString(new Date());
      await this.updateAdminDailyUninstallLog(false, shop, dateString);
      if (!report.uninstalledUser) report.uninstalledUser = 1;
      else report.uninstalledUser += 1;
      const shopInstalled = await this.shopInstalledRepository.findOne({ where: { shop } });
      if (shopInstalled) {
        const installedTimestamp = new Date(shopInstalled.dateInstalled).getTime();
        const actionTimestamp = reportDate.getTime();
        if (actionTimestamp - installedTimestamp <= 24 * 60 * 60 * 1000) {
          if (!report.uninstallInDay) report.uninstallInDay = 1;
          else report.uninstallInDay += 1;
        }
      }
      const shopGeneral = await this.shopGeneralRepository.findOne({ where: { shop } });
      if (shopGeneral && shopGeneral.plan !== PricingPlan.Free) {
        if (!report.paidUninstall) report.paidUninstall = 1;
        else report.paidUninstall += 1;
      }
    } else if (action === UpdateReportAction.UPGRADE) {
      if (!report.upgradeUser) report.upgradeUser = 1;
      else report.upgradeUser += 1;
      const shopInstalled = await this.shopInstalledRepository.findOne({ where: { shop } });
      if (shopInstalled) {
        const installedTimestamp = new Date(shopInstalled.dateInstalled).getTime();
        const actionTimestamp = reportDate.getTime();
        if (actionTimestamp - installedTimestamp <= 24 * 60 * 60 * 1000) {
          if (!report.upgradePlanInDay) report.upgradePlanInDay = 1;
          else report.upgradePlanInDay += 1;
        }
      }
    } else if (action === UpdateReportAction.DOWNGRADE_FREE) {
      if (!report.downgradeFreeUser) report.downgradeFreeUser = 1;
      else report.downgradeFreeUser += 1;
    } else if (action === UpdateReportAction.DOWNGRADE) {
      if (!report.downgradeUser) report.downgradeUser = 1;
      else report.downgradeUser += 1;
    } else if (action === UpdateReportAction.CLOSE_STORE) {
      if (!report.closeStore) report.closeStore = 1;
      else report.closeStore += 1;
    }
    let attempts = 0;
    const maxAttempts = 3;
    while (attempts < maxAttempts) {
      try {
        await this.adminDailyLogRepository.save(report);
        break;
      } catch (error) {
        attempts++;
        if (attempts >= maxAttempts) {
          console.log('Error update shop report', shop, action, error);
          throw error;
        }
      }
    }
  }

  async generateShopPublicMetafieldKey(shop: string): Promise<string> {
    const key = generateHmacKey(shop, process.env.PUBLIC_API_HMAC_KEY);
    return key;
  }

  async countRule() {
    const activeShops = await this.shopInstalledRepository.find({ where: { uninstalled: false, closeStore: false } });
    const numberPostalCodePerRuleAndCount: Record<string, number> = {};
    const numberCountryCodePerRuleAndCount: Record<string, number> = {};
    const numberRegionPerRuleAndCount: Record<string, number> = {};
    const numberProductAppliedAndCount: Record<string, number> = {};
    const numberCollectionAppliedAndCount: Record<string, number> = {};
    const numberVendorAppliedAndCount: Record<string, number> = {};
    const numberProductExcludedAndCount: Record<string, number> = {};
    const numberCollectionExcludedAndCount: Record<string, number> = {};
    const numberVendorExcludedAndCount: Record<string, number> = {};
    const numberProductExceptionsAndCount: Record<string, number> = {};
    for (const shopInstall of activeShops) {
      const { shop } = shopInstall;
      const shopInfo = await this.shopInfoRepository.findOne({ where: { shop } });
      if (isTestShop(shopInfo)) continue;
      const shopGeneral = await this.shopGeneralRepository.findOne({ where: { shop } });
      if (!shopGeneral) {
        console.log('no shopGeneral', shop);
        continue;
      }
    }
    return {
      numberPostalCodePerRuleAndCount,
      numberCountryCodePerRuleAndCount,
      numberRegionPerRuleAndCount,
      numberProductAppliedAndCount,
      numberCollectionAppliedAndCount,
      numberVendorAppliedAndCount,
      numberProductExcludedAndCount,
      numberCollectionExcludedAndCount,
      numberVendorExcludedAndCount,
      numberProductExceptionsAndCount,
    };
  }

  async updateShopPlan(payload: UpdateShopPlanDto) {
    const shopGeneral = await this.shopGeneralRepository.findOne({ where: { shop: payload.shop } });
    if (!shopGeneral) throw new NotFoundException('Shop general not found');
    const updateShopPlan = this.shopGeneralRepository.create(payload);
    updateShopPlan.id = shopGeneral.id;
    await this.shopGeneralRepository.save(updateShopPlan);
    await this.searchUsersAdmin({ search: payload.shop, page: 1, perPage: -1 });
    return {
      code: 200,
      status: 'success',
    };
  }

  async updateAdminDailyUninstallLog(isWebhook: boolean, shop: string, date: string) {
    const logExist = await this.adminDailyUninstallLogRepository.findOne({ where: { createdDate: date } });
    if (isWebhook) {
      const log = this.adminDailyUninstallLogRepository.create({
        id: logExist?.id,
        createdDate: date,
        shopWebhook: logExist?.shopWebhook ? logExist.shopWebhook + ',' + shop : shop,
      });
      await this.adminDailyUninstallLogRepository.save(log);
    } else {
      const log = this.adminDailyUninstallLogRepository.create({
        id: logExist?.id,
        createdDate: date,
        shopEvent: logExist?.shopEvent ? logExist.shopEvent + ',' + shop : shop,
      });
      await this.adminDailyUninstallLogRepository.save(log);
    }
  }

  async getDailyUninstallLog(payload: GetAdminDailyUninstallLogDto): Promise<GetAdminDailyUninstallLogResponse> {
    const startDate = new Date(payload.startDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(payload.endDate);
    endDate.setHours(0, 0, 0, 0);
    const startYear = startDate.getFullYear();
    const startMonth = startDate.getMonth();
    const startDay = startDate.getDate();
    const endYear = endDate.getFullYear();
    const endMonth = endDate.getMonth();
    const endDay = endDate.getDate();
    const adminDailyUninstallLog = await this.adminDailyUninstallLogRepository.find({
      where: { createdDate: Between(new Date(startYear, startMonth, startDay), new Date(endYear, endMonth, endDay)) },
      order: { createdDate: 'ASC' },
    });
    const result: ResultAdminDailyUninstallLog[] = [];
    if (!adminDailyUninstallLog.length) return { code: 200, message: 'no data', data: [] };
    adminDailyUninstallLog.forEach((log) => {
      const dataShopWebhook = log.shopWebhook ? log.shopWebhook.split(',') : [];
      const dataShopEvent = log.shopEvent ? log.shopEvent.split(',') : [];
      const resultWebhook: { [key: string]: number } = {};
      const resultEvent: { [key: string]: number } = {};
      dataShopWebhook.forEach((shop) => {
        resultWebhook[shop] = (resultWebhook[shop] || 0) + 1;
      });
      dataShopEvent.forEach((shop) => {
        resultEvent[shop] = (resultEvent[shop] || 0) + 1;
      });
      const countWebhook = Object.entries(resultWebhook).map(([shop, count]) => ({ shop, count }));
      const countEvent = Object.entries(resultEvent).map(([shop, count]) => ({ shop, count }));
      result.push({ date: formatDateString(log.createdDate), shopWebhook: countWebhook, shopEvent: countEvent });
    });
    return { code: 200, message: 'success', data: result };
  }
}
