import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Request, UseGuards } from "@nestjs/common";
import { LotsService } from "./lots.service";
import { CreateLotDto } from "../dto/lotsmake.dto";
import { AuthGuard } from "../auth/auth.guard";
import { CreateLotActionDto } from "../dto/create-lot-action.dto";
import { ChangeEnvDTO } from "../dto/change-env.dto";

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
  getFermeLots(@Request() req) {
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



}
