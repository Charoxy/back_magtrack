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
import { EnvironmentsService } from "./environments.service";
import { Environnement } from "../entities/entitie.environements";
import { AuthGuard } from "../auth/auth.guard";
import { EnvMake } from "../dto/envmake";
import { CreateConditionEnvironnementaleDto } from "../dto/conditionenvMake";

@UseGuards(AuthGuard)
@Controller('environments')
export class EnvironmentsController {

  constructor(
    readonly environmentsService: EnvironmentsService
  ) {

  }

  @Get()
  async getAllEnvironments(@Request() req) {
    return this.environmentsService.getAllEnvironments(req.user.sub);
  }

  @Get('conditionsToday/:id')
  async getEnvironmentConditionsToday(@Param() id: { id: number }, @Request() req) {
    return {today: await this.environmentsService.isTodayConditionsIsSubmitted(id.id, req.user.sub)};
  }

  @Get('conditions/last-before')
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
  async makeEnvironment(@Request() req, @Body() env: EnvMake) {
    console.log(req.user.sub);
    console.log(env);
    return this.environmentsService.makeEnvironment(env, req.user.sub);
  }

  @Get('with-lots')
  async getEnvironmentsWithLots(@Request() req) {
    return this.environmentsService.getAllEnvironmentsWithLots(req.user.sub);
  }

  // Ces endpoints ont été supprimés car les méthodes n'existaient pas dans le service
  // et présentaient des vulnérabilités de sécurité (@Body au lieu de @Param)

  @Post('conditions')
  async makeEnvironmentCondition(@Body() condition: CreateConditionEnvironnementaleDto, @Request() req) {
    return this.environmentsService.makeEnvironmentCondition(condition, req.user.sub);
  }

  @Get('lots/:id')
  async getEnvironmentLots(@Param('id') id: number, @Request() req) {
    return this.environmentsService.getEnvironmentLots(id, req.user.sub);
  }

  @Post('lots')
  async makeEnvironmentLot(@Body() lot: any, @Request() req) {
    return this.environmentsService.makeEnvironmentLot(lot, req.user.sub);
  }

  // Nouveaux endpoints pour les statistiques d'environnement

  @Get(':id')
  async getEnvironmentDetails(@Param('id') id: number, @Request() req) {
    return this.environmentsService.getEnvironmentDetails(id, req.user.sub);
  }

  @Get(':id/statistics')
  async getEnvironmentStatistics(@Param('id') id: number, @Request() req) {
    return this.environmentsService.getEnvironmentStatistics(id, req.user.sub);
  }

  @Get(':id/conditions-summary')
  async getEnvironmentConditionsSummary(@Param('id') id: number, @Request() req) {
    return this.environmentsService.getEnvironmentConditionsSummary(id, req.user.sub);
  }

  @Get(':id/current-lots')
  async getEnvironmentCurrentLots(@Param('id') id: number, @Request() req) {
    return this.environmentsService.getEnvironmentCurrentLots(id, req.user.sub);
  }

  @Get(':id/lots-history')
  async getEnvironmentLotsHistory(@Param('id') id: number, @Request() req) {
    return this.environmentsService.getEnvironmentLotsHistory(id, req.user.sub);
  }

  @Get(':id/monthly-performance')
  async getEnvironmentMonthlyPerformance(@Param('id') id: number, @Request() req) {
    return this.environmentsService.getEnvironmentMonthlyPerformance(id, req.user.sub);
  }

}
