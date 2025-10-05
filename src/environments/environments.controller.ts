import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  Request,
  UseGuards
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiCookieAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { EnvironmentsService } from "./environments.service";
import { Environnement } from "../entities/entitie.environements";
import { AuthGuard } from "../auth/auth.guard";
import { EnvMake } from "../dto/envmake";
import { CreateConditionEnvironnementaleDto } from "../dto/conditionenvMake";

@ApiTags('Environnements')
@ApiCookieAuth()
@UseGuards(AuthGuard)
@Controller('environments')
export class EnvironmentsController {

  constructor(
    readonly environmentsService: EnvironmentsService
  ) {

  }

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les environnements de l\'utilisateur' })
  @ApiResponse({
    status: 200,
    description: 'Liste des environnements',
    schema: {
      example: [{
        id: 1,
        nom: 'Serre #1',
        type: 'culture',
        culture_type: 'indoor',
        surface_m2: 50.5
      }]
    }
  })
  async getAllEnvironments(@Request() req) {
    return this.environmentsService.getAllEnvironments(req.user.sub);
  }

  @Get('conditionsToday/:id')
  @ApiOperation({ summary: 'Vérifier si les conditions du jour ont été soumises' })
  @ApiParam({ name: 'id', description: 'ID de l\'environnement' })
  @ApiResponse({ status: 200, schema: { example: { today: true } } })
  async getEnvironmentConditionsToday(@Param() id: { id: number }, @Request() req) {
    return {today: await this.environmentsService.isTodayConditionsIsSubmitted(id.id, req.user.sub)};
  }

  @Get('conditions/last-before')
  @ApiOperation({ summary: 'Récupérer la dernière condition avant une date pour un lot' })
  @ApiQuery({ name: 'lotId', description: 'ID du lot' })
  @ApiQuery({ name: 'date', description: 'Date de référence (ISO)' })
  @ApiResponse({ status: 200, description: 'Dernière condition enregistrée' })
  async getLastConditionBefore(
    @Query('lotId') lotId: number,
    @Query('date') date: string,
    @Request() req
  ) {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      throw new BadRequestException('Date invalide');
    }

    return this.environmentsService.getConditionForLotAtDate(lotId, parsedDate ,req.user.sub);
  }


  @Post()
  @ApiOperation({ summary: 'Créer un nouvel environnement' })
  @ApiResponse({
    status: 201,
    description: 'Environnement créé',
    schema: {
      example: {
        id: 1,
        nom: 'Serre #1',
        type: 'culture',
        culture_type: 'indoor',
        surface_m2: 50.5,
        capacite_max_plants: 100
      }
    }
  })
  async makeEnvironment(@Request() req, @Body() env: EnvMake) {
    console.log(req.user.sub);
    console.log(env);
    return this.environmentsService.makeEnvironment(env, req.user.sub);
  }

  @Get('with-lots')
  @ApiOperation({ summary: 'Récupérer tous les environnements avec leurs lots associés' })
  @ApiResponse({ status: 200, description: 'Environnements avec lots' })
  async getEnvironmentsWithLots(@Request() req) {
    return this.environmentsService.getAllEnvironmentsWithLots(req.user.sub);
  }

  @Post('conditions')
  @ApiOperation({ summary: 'Enregistrer les conditions environnementales' })
  @ApiResponse({
    status: 201,
    description: 'Conditions enregistrées',
    schema: {
      example: {
        id: 1,
        temperature: 24.5,
        humidite: 65.0,
        co2: 800,
        date_heure: '2024-01-20T10:00:00Z'
      }
    }
  })
  async makeEnvironmentCondition(@Body() condition: CreateConditionEnvironnementaleDto, @Request() req) {
    return this.environmentsService.makeEnvironmentCondition(condition, req.user.sub);
  }

  @Get('lots/:id')
  @ApiOperation({ summary: 'Récupérer les lots d\'un environnement' })
  @ApiParam({ name: 'id', description: 'ID de l\'environnement' })
  @ApiResponse({ status: 200, description: 'Lots de l\'environnement' })
  async getEnvironmentLots(@Param('id') id: number, @Request() req) {
    return this.environmentsService.getEnvironmentLots(id, req.user.sub);
  }

  @Post('lots')
  @ApiOperation({ summary: 'Assigner un lot à un environnement' })
  @ApiResponse({ status: 201, description: 'Lot assigné à l\'environnement' })
  async makeEnvironmentLot(@Body() lot: any, @Request() req) {
    return this.environmentsService.makeEnvironmentLot(lot, req.user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer les détails d\'un environnement' })
  @ApiParam({ name: 'id', description: 'ID de l\'environnement' })
  @ApiResponse({ status: 200, description: 'Détails de l\'environnement' })
  async getEnvironmentDetails(@Param('id') id: number, @Request() req) {
    return this.environmentsService.getEnvironmentDetails(id, req.user.sub);
  }

  @Get(':id/statistics')
  @ApiOperation({ summary: 'Récupérer les statistiques d\'un environnement' })
  @ApiParam({ name: 'id', description: 'ID de l\'environnement' })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        current_lots: 5,
        total_lots_history: 25,
        completed_lots: 20,
        total_plants: 150,
        total_yield_g: 5000.5,
        avg_yield_per_lot: 250.0,
        avg_duration_days: 90,
        success_rate: 95.5
      }
    }
  })
  async getEnvironmentStatistics(@Param('id') id: number, @Request() req) {
    return this.environmentsService.getEnvironmentStatistics(id, req.user.sub);
  }

  @Get(':id/conditions-summary')
  @ApiOperation({ summary: 'Récupérer le résumé des conditions climatiques' })
  @ApiParam({ name: 'id', description: 'ID de l\'environnement' })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        avg_temperature: 24.5,
        avg_humidity: 65.0,
        min_temperature: 18.0,
        max_temperature: 28.0,
        min_humidity: 50.0,
        max_humidity: 75.0,
        last_update: '2024-01-20T10:00:00Z'
      }
    }
  })
  async getEnvironmentConditionsSummary(@Param('id') id: number, @Request() req) {
    return this.environmentsService.getEnvironmentConditionsSummary(id, req.user.sub);
  }

  @Get(':id/current-lots')
  @ApiOperation({ summary: 'Récupérer les lots actuellement dans l\'environnement' })
  @ApiParam({ name: 'id', description: 'ID de l\'environnement' })
  @ApiResponse({ status: 200, description: 'Lots actifs dans l\'environnement' })
  async getEnvironmentCurrentLots(@Param('id') id: number, @Request() req) {
    return this.environmentsService.getEnvironmentCurrentLots(id, req.user.sub);
  }

  @Get(':id/lots-history')
  @ApiOperation({ summary: 'Récupérer l\'historique des lots de l\'environnement' })
  @ApiParam({ name: 'id', description: 'ID de l\'environnement' })
  @ApiResponse({ status: 200, description: 'Historique des lots' })
  async getEnvironmentLotsHistory(@Param('id') id: number, @Request() req) {
    return this.environmentsService.getEnvironmentLotsHistory(id, req.user.sub);
  }

  @Get(':id/monthly-performance')
  @ApiOperation({ summary: 'Récupérer les performances mensuelles de l\'environnement' })
  @ApiParam({ name: 'id', description: 'ID de l\'environnement' })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        months: [
          { month: '2024-01', month_label: 'Jan', lots_completed: 3, yield_g: 750.5, avg_duration: 85 }
        ]
      }
    }
  })
  async getEnvironmentMonthlyPerformance(@Param('id') id: number, @Request() req) {
    return this.environmentsService.getEnvironmentMonthlyPerformance(id, req.user.sub);
  }

}
