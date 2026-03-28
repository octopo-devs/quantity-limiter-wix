import { IsDateString, IsEnum, IsNumber, IsNumberString, IsOptional, IsString } from 'class-validator';
import { DefaultPaginationRequest } from 'src/docs/default/default-request.swagger';
import { DashboardGroupPlanBy } from '../types/admin.enum';
import { SortDirection } from 'src/shared/common/types/shared.enum';
import { OmitType } from '@nestjs/swagger';
import { PricingPlan } from 'src/shared/api/types/wix-api/wix-api.enum';

export class SearchUsersAdminDto extends DefaultPaginationRequest {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(PricingPlan)
  plan?: PricingPlan;

  @IsOptional()
  @IsEnum(SortDirection)
  sortUninstallAfter?: SortDirection;

  @IsOptional()
  @IsEnum(SortDirection)
  sortLastAccess?: SortDirection;
}

export class GetDashboardSummaryDto {
  @IsDateString()
  startDate: Date;

  @IsDateString()
  endDate: Date;

  @IsOptional()
  @IsEnum(PricingPlan)
  plan?: PricingPlan;
}

export class GetAdminDailyUninstallLogDto extends OmitType(GetDashboardSummaryDto, ['plan']) {}

export class CreateAppPerformanceLogDto {
  @IsString()
  shop: string;

  @IsNumber()
  value: number;

  @IsString()
  path: string;
}

export class AdminDashboardGroupPlanDto {
  @IsNumberString()
  year: string;

  @IsOptional()
  @IsEnum(DashboardGroupPlanBy)
  groupBy?: DashboardGroupPlanBy;

  @IsOptional()
  @IsEnum(PricingPlan)
  plan?: PricingPlan;
}

export class UpdateShopPlanDto {
  @IsString()
  shop: string;

  @IsEnum(PricingPlan)
  plan: PricingPlan;
}
