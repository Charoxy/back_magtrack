import { Body, Controller, Delete, Get, Patch, Post, UseGuards, Param } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiCookieAuth, ApiParam } from '@nestjs/swagger';
import { VarieteService } from "./variete.service";
import { Variete } from "../entities/entitie.variete";
import { UpdateResult } from "typeorm";
import { AuthGuard } from "../auth/auth.guard";
import { CreateVarieteDto } from "../dto/varietemake.dto";

@ApiTags('Variétés')
@ApiCookieAuth()
@UseGuards(AuthGuard)
@Controller('variete')
export class VarieteController {

  constructor(
    private readonly varieteService: VarieteService,
  ) { }

  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les variétés' })
  @ApiResponse({
    status: 200,
    description: 'Liste des variétés',
    schema: {
      example: [{
        id: 1,
        nom: 'Purple Haze',
        type: 'Sativa',
        breeder: 'HokuSeed',
        tauxTHC: 18.5,
        tauxCBD: 0.8,
        description: 'Variété sativa classique'
      }]
    }
  })
  async getAllVariete(): Promise<Variete[]> {
    return await this.varieteService.getAllVariete();
  }

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle variété' })
  @ApiResponse({
    status: 201,
    description: 'Variété créée',
    schema: {
      example: {
        id: 1,
        nom: 'Purple Haze',
        type: 'Sativa',
        breeder: 'HokuSeed',
        tauxTHC: 18.5,
        tauxCBD: 0.8
      }
    }
  })
  async createVariete(@Body() variete: CreateVarieteDto): Promise<Variete> {
    return await this.varieteService.createVariete(variete);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une variété par ID' })
  @ApiParam({ name: 'id', description: 'ID de la variété' })
  @ApiResponse({ status: 200, description: 'Détails de la variété' })
  async getVarieteById(@Param('id') id: number): Promise<Variete> {
    return await this.varieteService.getVarieteById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour une variété' })
  @ApiParam({ name: 'id', description: 'ID de la variété' })
  @ApiResponse({ status: 200, description: 'Variété mise à jour' })
  async updateVariete(@Body() variete: Variete): Promise<UpdateResult> {
    return await this.varieteService.updateVariete(variete);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une variété' })
  @ApiParam({ name: 'id', description: 'ID de la variété' })
  @ApiResponse({ status: 200, description: 'Variété supprimée' })
  async deleteVariete(@Param('id') id: number): Promise<void> {
    return await this.varieteService.deleteVariete(id);
  }


}
