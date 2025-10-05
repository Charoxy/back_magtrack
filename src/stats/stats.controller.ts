import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiCookieAuth } from '@nestjs/swagger';
import { StatsService } from './stats.service';
import { AuthGuard } from '../auth/auth.guard';

@ApiTags('Statistiques')
@ApiCookieAuth()
@UseGuards(AuthGuard)
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Vue d\'ensemble des statistiques générales' })
  @ApiResponse({
    status: 200,
    description: 'Statistiques générales',
    schema: {
      example: {
        total_lots: 25,
        active_lots: 12,
        total_plants: 180,
        total_harvest: 5500.5,
        avg_yield_per_lot: 220.0
      }
    }
  })
  getOverview(@Request() req) {
    return this.statsService.getOverview(req.user.sub);
  }

  @Get('stage-distribution')
  @ApiOperation({ summary: 'Distribution des lots par étape de culture' })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        Croissance: 5,
        Floraison: 4,
        Sechage: 2,
        Maturation: 1
      }
    }
  })
  getStageDistribution(@Request() req) {
    return this.statsService.getStageDistribution(req.user.sub);
  }

  @Get('monthly-trends')
  @ApiOperation({ summary: 'Tendances mensuelles de production' })
  @ApiResponse({
    status: 200,
    schema: {
      example: [
        { month: '2024-01', lots_started: 5, lots_completed: 3, total_yield: 750.5 }
      ]
    }
  })
  getMonthlyTrends(@Request() req) {
    return this.statsService.getMonthlyTrends(req.user.sub);
  }

  @Get('variety-performance')
  @ApiOperation({ summary: 'Performance par variété' })
  @ApiResponse({
    status: 200,
    schema: {
      example: [{
        variete: 'Purple Haze',
        lots_count: 5,
        avg_yield: 250.5,
        total_yield: 1252.5
      }]
    }
  })
  getVarietyPerformance(@Request() req) {
    return this.statsService.getVarietyPerformance(req.user.sub);
  }

  @Get('environment-performance')
  @ApiOperation({ summary: 'Performance par environnement' })
  @ApiResponse({
    status: 200,
    schema: {
      example: [{
        environment_name: 'Serre #1',
        environment_type: 'indoor',
        lots_count: 15,
        avg_yield: 220.0,
        success_rate: 95.5
      }]
    }
  })
  getEnvironmentPerformance(@Request() req) {
    return this.statsService.getEnvironmentPerformance(req.user.sub);
  }
}