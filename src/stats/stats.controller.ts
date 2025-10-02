import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { StatsService } from './stats.service';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('overview')
  getOverview(@Request() req) {
    return this.statsService.getOverview(req.user.sub);
  }

  @Get('stage-distribution')
  getStageDistribution(@Request() req) {
    return this.statsService.getStageDistribution(req.user.sub);
  }

  @Get('monthly-trends')
  getMonthlyTrends(@Request() req) {
    return this.statsService.getMonthlyTrends(req.user.sub);
  }

  @Get('variety-performance')
  getVarietyPerformance(@Request() req) {
    return this.statsService.getVarietyPerformance(req.user.sub);
  }

  @Get('environment-performance')
  getEnvironmentPerformance(@Request() req) {
    return this.statsService.getEnvironmentPerformance(req.user.sub);
  }
}