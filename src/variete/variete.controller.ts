import { Body, Controller, Delete, Get, Patch, Post, UseGuards } from "@nestjs/common";
import { VarieteService } from "./variete.service";
import { Variete } from "../entities/entitie.variete";
import { UpdateResult } from "typeorm";
import { AuthGuard } from "../auth/auth.guard";
import { CreateVarieteDto } from "../dto/varietemake.dto";

// @ts-ignore
@UseGuards(AuthGuard)
@Controller('variete')
export class VarieteController {

  constructor(
    private readonly varieteService: VarieteService,
  ) { }

  @Get()
  async getAllVariete(): Promise<Variete[]> {
    return await this.varieteService.getAllVariete();
  }

  @Post()
  async createVariete(@Body() variete: CreateVarieteDto): Promise<Variete> {
    return await this.varieteService.createVariete(variete);
  }

  @Get(':id')
  async getVarieteById(@Body() id: number): Promise<Variete> {
    return await this.varieteService.getVarieteById(id);
  }

  @Patch(':id')
  async updateVariete(@Body() variete: Variete): Promise<UpdateResult> {
    return await this.varieteService.updateVariete(variete);
  }

  @Delete(':id')
  async deleteVariete(@Body() id: number): Promise<void> {
    return await this.varieteService.deleteVariete(id);
  }


}
