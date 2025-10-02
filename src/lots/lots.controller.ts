import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query, Request, UseGuards } from "@nestjs/common";
import { LotsService } from "./lots.service";
import { CreateLotDto } from "../dto/lotsmake.dto";
import { AuthGuard } from "../auth/auth.guard";
import { CreateLotActionDto } from "../dto/create-lot-action.dto";
import { ChangeEnvDTO } from "../dto/change-env.dto";
import { CreateShareLots } from "src/dto/create-share-lots";
import { UpdateLotQuantityDto } from "src/dto/update-lot-quantity.dto";

@UseGuards(AuthGuard)
@Controller('lots')
export class LotsController {

  constructor(
    private readonly lotsService: LotsService,
  ) { }

  @Post()
  createLot(@Request() req, @Body() lot: CreateLotDto) {
    return this.lotsService.createLot(lot, req.user.sub);
  }

  @Get()
  getAllLots(@Request() req) {
    return this.lotsService.findAll(req.user.sub);
  }

  @Get('view/:id')
  async getLotById(@Request() req, @Param('id') id: number) {
    const find = await this.lotsService.findOne(id, req.user.sub);
    return find;
  }

  @Get('actif')
  getActifLots(@Request() req) {
    return this.lotsService.findActif(req.user.sub);
  }

  @Get('old')
  getOldLots(@Request() req) {
    return this.lotsService.findOld(req.user.sub);
  }

  @Get('actions/:id')
  getActions(@Request() req, @Param('id') id: number) {
    return this.lotsService.getActions(id, req.user.sub);
  }

  @Post('actions/:id')
  addAction(@Request() req, @Param('id') id: number, @Body() action: CreateLotActionDto) {
    return this.lotsService.addAction(id, action, req.user.sub);
  }

  @HttpCode(HttpStatus.OK)
  @Delete('actions/:id')
  deleteAction(@Request() req, @Param('id') id: number) {
    return this.lotsService.deleteAction(id, req.user.sub);
  }

  @Get('stageWithDays/:id')
  getStage(@Request() req, @Param('id') id: number, @Query('date') date: string) {
    return this.lotsService.getStage(id, req.user.sub, new Date(date));
  }

  @Post('share-lots')
  makeShareLot(@Request() req, @Body() shareLot: CreateShareLots) {
    return this.lotsService.makeShareLot(shareLot, req.user.sub);
  }

  @Get('statistics')
  getStatistics(@Request() req) {
    return this.lotsService.getStatistics(req.user.sub);
  }

  @Get('recent-activities')
  getRecentActivities(@Request() req) {
    return this.lotsService.getRecentActivities(req.user.sub);
  }

  @Get('culture-evolution')
  getCultureEvolution(@Request() req) {
    return this.lotsService.getCultureEvolution(req.user.sub);
  }

  @Put(':id/quantity')
  updateLotQuantity(@Request() req, @Param('id') id: number, @Body() updateQuantityDto: UpdateLotQuantityDto) {
    return this.lotsService.updateLotQuantity(id, updateQuantityDto.quantite, req.user.sub);
  }


  @Get('maturation')
  getMaturationLots(@Request() req) {
    return this.lotsService.getMaturationLots(req.user.sub);
  }


}
