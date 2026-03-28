import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { DefaultAuthRequest } from 'src/docs/default/default-request.swagger';
import { Ga4Event } from 'src/shared/api/types/analytics-api/analytics-api.enum';
import { CurrentOnboardingStep, LogRule, TouchPoints } from '../types/analytics.enum';
import { IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { OmitType } from '@nestjs/swagger';
import { PlanSubscription, PricingPlan } from 'src/shared/api/types/wix-api/wix-api.enum';

export class SendGa4EventDto extends DefaultAuthRequest {
  @IsEnum(Ga4Event)
  event: Ga4Event;

  @IsOptional()
  @IsEnum(PricingPlan)
  plan?: PricingPlan;

  @IsOptional()
  @IsEnum(PlanSubscription)
  type?: PlanSubscription;
}

export class CreateAppOnboardingLogDto {
  @IsString()
  shop: string;

  @IsNumber()
  current_step: CurrentOnboardingStep;
}

export class GetOnboardingAnalyticsDto {
  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsEnum(PricingPlan)
  plan?: PricingPlan;
}

export class GetRuleAnalyticsDto extends OmitType(GetOnboardingAnalyticsDto, ['plan']) {
  @IsString()
  shop: string;
}

export class LogTouchpointDto extends DefaultAuthRequest {
  @IsEnum(TouchPoints)
  touchpoint: TouchPoints;
}

export class DataLogRule {
  @IsNumber()
  ruleId: number;

  @IsOptional()
  @IsEnum(LogRule)
  logs?: LogRule;
}
export class LogRuleDto extends DefaultAuthRequest {
  @Type(() => DataLogRule)
  data: DataLogRule[];
}
