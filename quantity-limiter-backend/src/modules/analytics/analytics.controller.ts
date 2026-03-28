import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { BadRequestResponse, DefaultResponse } from 'src/docs/default/default-response.swagger';
import { HeaderAuthGuard } from 'src/shared/auth/guards/header-auth.guard';
import { AnalyticsService } from './analytics.service';
import {
  CreateAppOnboardingLogDto,
  GetOnboardingAnalyticsDto,
  LogTouchpointDto,
  SendGa4EventDto,
} from './dto/analytics.dto';
import { OnboardingStatsResponse, TouchpointStatsResponse } from './response/analytics.response';

@Controller('analytics')
@ApiTags('Analytics')
@ApiBearerAuth('token')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('analytic/ga-4/event')
  @UseGuards(HeaderAuthGuard)
  @ApiOperation({ summary: 'Send GA4 event' })
  sendGa4Event(@Body() body: SendGa4EventDto) {
    return this.analyticsService.sendGa4Event(body);
  }

  @Post('analytic/onboarding')
  @ApiCreatedResponse({
    description: 'The onboarding step has been successfully updated. No additional data is returned in the response.',
  })
  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiOperation({
    summary: 'Current steps number explain',
    description:
      'current_step = 6 means the user has skipped or finished onboarding. Check Schema current_step to see the valid current_step value',
  })
  updateOnboardingStep(@Body() body: CreateAppOnboardingLogDto) {
    return this.analyticsService.updateOnboardingStep(body);
  }

  @Get('analytic/onboarding')
  @ApiOkResponse({ type: OnboardingStatsResponse })
  getOnboardingAnalytics(@Query() getOnboardingAnalytics: GetOnboardingAnalyticsDto) {
    return this.analyticsService.getOnboardingStats(getOnboardingAnalytics);
  }

  @Post('analytic/touchpoint')
  @ApiOkResponse({ type: DefaultResponse })
  logTouchpoint(@Body() body: LogTouchpointDto) {
    return this.analyticsService.logTouchpoint(body);
  }

  @Get('analytic/touchpoint')
  @ApiOkResponse({ type: TouchpointStatsResponse })
  getTouchpointAnalytics(@Query() query: GetOnboardingAnalyticsDto) {
    return this.analyticsService.getTouchpointsLog(query);
  }
}
