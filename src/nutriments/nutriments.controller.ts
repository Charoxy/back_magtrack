import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { NutrimentsService } from "./nutriments.service";
import { CreateNutrimentsDto } from "../dto/nutrimentsmake.dto";
import { AuthGuard } from "../auth/auth.guard";

@UseGuards(AuthGuard)
@Controller('nutriments')
export class NutrimentsController {

  constructor(
    private readonly nutrimentsService: NutrimentsService,
  ) {}

  @Get()
  async getAllNutriments() {
    return this.nutrimentsService.getAllNutriments();
  }

  @Get(':id')
  async getNutrimentById(@Param('id') id: number) {
    return this.nutrimentsService.getNutrimentById(id);
  }

  @Post()
  async createNutriment(@Body() nutriment: CreateNutrimentsDto) {
    return this.nutrimentsService.createNutriment(nutriment);
  }

}
