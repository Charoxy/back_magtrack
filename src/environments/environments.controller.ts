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
  async getAllEnvironments() {
    return this.environmentsService.getAllEnvironments();
  }

  @Get('conditionsToday/:id')
  async getEnvironmentConditionsToday(@Param() id: { id: number }) {
    return {today: await this.environmentsService.isTodayConditionsIsSubmitted(id.id)};
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

  @Get('conditions/:id')
  async getEnvironmentConditions(@Body() id: number) {
    return this.environmentsService.getEnvironmentConditions(id);
  }

  @Get('last-conditions/:id')
  async getLastEnvironmentConditions(@Body() id: number) {
    return this.environmentsService.getLastEnvironmentConditions(id);
  }

  @Post('conditions')
  async makeEnvironmentCondition(@Body() condition: CreateConditionEnvironnementaleDto, @Request() req) {
    return this.environmentsService.makeEnvironmentCondition(condition, req.user.sub);
  }

  @Get('lots/:id')
  async getEnvironmentLots(@Body() id: number) {
    return this.environmentsService.getEnvironmentLots(id);
  }

  @Post('lots')
  async makeEnvironmentLot(@Body() lot: any) {
    return this.environmentsService.makeEnvironmentLot(lot);
  }

}
