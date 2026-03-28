import { Body, Controller, Get, ParseIntPipe, Post, Put, Query, UseInterceptors } from '@nestjs/common';
import { AdminService } from './admin.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  AdminSummaryResponse,
  CreateAppPerformanceLogResponse,
  DashboardGroupPlanResponse,
  GetAdminDailyUninstallLogResponse,
  GetAppPerformanceLogResponse,
  SearchUsersAdminResponse,
  UserInfoResponse,
} from './response/admin.response';
import {
  AdminDashboardGroupPlanDto,
  CreateAppPerformanceLogDto,
  GetAdminDailyUninstallLogDto,
  GetDashboardSummaryDto,
  SearchUsersAdminDto,
  UpdateShopPlanDto,
} from './dto/admin.dto';
import { CustomCacheInterceptor } from 'src/shared/common/decorators/custom-cache.decorator';
import { CacheTTL } from '@nestjs/cache-manager';

@Controller('admin')
@ApiTags('Admin')
@UseInterceptors(CustomCacheInterceptor)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard/user-summary')
  @CacheTTL(10 * 1000)
  @ApiOkResponse({ type: AdminSummaryResponse })
  dashboardSummary(@Query() query: GetDashboardSummaryDto) {
    return this.adminService.getDashboardSummary(query);
  }

  @Get('dashboard/performance-logs')
  @CacheTTL(10 * 1000)
  @ApiOkResponse({ type: GetAppPerformanceLogResponse })
  getAppPerformanceLogs(@Query() query: GetDashboardSummaryDto) {
    return this.adminService.getAppPerformanceLogs(query);
  }

  @Post('dashboard/performance-log')
  @ApiOkResponse({ type: CreateAppPerformanceLogResponse })
  createAppPerformanceLog(@Body() body: CreateAppPerformanceLogDto) {
    return this.adminService.createAppPerformanceLog(body);
  }

  @Get('dashboard/active-plan')
  @CacheTTL(10 * 60 * 1000)
  @ApiOkResponse({ type: DashboardGroupPlanResponse })
  @ApiOperation({ summary: 'Get user active plan' })
  getDashboardActivePlan(@Query() query: AdminDashboardGroupPlanDto) {
    return this.adminService.getDashboardActivePlan(query);
  }

  @Get('users/search')
  @CacheTTL(10 * 1000)
  @ApiOkResponse({ type: SearchUsersAdminResponse })
  searchUsersList(@Query() query: SearchUsersAdminDto) {
    return this.adminService.searchUsersAdmin(query);
  }

  @Get('user/info')
  @ApiOkResponse({ type: UserInfoResponse })
  getUserInfo(@Query('id', ParseIntPipe) id: number) {
    return this.adminService.getUserInfo(id);
  }

  @Get('generate-shop-public-metafield-key')
  generateShopPublicMetafieldKey(@Query('shop') shop: string) {
    return this.adminService.generateShopPublicMetafieldKey(shop);
  }

  @Get('count/rule')
  countRule() {
    return this.adminService.countRule();
  }

  @Get('check-service')
  @ApiOperation({ summary: 'Api service call check app available' })
  async checkService() {
    return true;
  }

  @Put('shop-plan')
  @ApiOperation({ summary: 'Update shop plan' })
  async updateShopPlan(@Body() body: UpdateShopPlanDto) {
    return this.adminService.updateShopPlan(body);
  }

  @Get('uninstall-log')
  @ApiOkResponse({ type: GetAdminDailyUninstallLogResponse })
  async getAdminDailyUninstallLog(@Query() query: GetAdminDailyUninstallLogDto) {
    return this.adminService.getDailyUninstallLog(query);
  }
}
