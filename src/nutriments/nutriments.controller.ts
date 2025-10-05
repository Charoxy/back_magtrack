import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiCookieAuth, ApiParam } from '@nestjs/swagger';
import { NutrimentsService } from "./nutriments.service";
import { CreateNutrimentsDto } from "../dto/nutrimentsmake.dto";
import { AuthGuard } from "../auth/auth.guard";

@ApiTags('Nutriments')
@ApiCookieAuth()
@UseGuards(AuthGuard)
@Controller('nutriments')
export class NutrimentsController {

  constructor(
    private readonly nutrimentsService: NutrimentsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les nutriments disponibles' })
  @ApiResponse({
    status: 200,
    description: 'Liste des nutriments',
    schema: {
      example: [{
        id: 1,
        nom: 'Bio·Grow',
        marque: 'BioBizz',
        type: 'organique',
        description: 'Engrais de croissance 100% biologique',
        isPublic: true
      }]
    }
  })
  async getAllNutriments() {
    return this.nutrimentsService.getAllNutriments();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un nutriment par ID' })
  @ApiParam({ name: 'id', description: 'ID du nutriment' })
  @ApiResponse({
    status: 200,
    description: 'Détails du nutriment',
    schema: {
      example: {
        id: 1,
        nom: 'Bio·Grow',
        marque: 'BioBizz',
        type: 'organique',
        description: 'Engrais de croissance liquide 100% biologique NPK 8-2-6',
        isPublic: true
      }
    }
  })
  async getNutrimentById(@Param('id') id: number) {
    return this.nutrimentsService.getNutrimentById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Créer un nouveau nutriment personnalisé' })
  @ApiResponse({
    status: 201,
    description: 'Nutriment créé',
    schema: {
      example: {
        id: 150,
        nom: 'Mon mélange perso',
        marque: 'Maison',
        type: 'organique',
        description: 'Mélange personnalisé',
        isPublic: false
      }
    }
  })
  async createNutriment(@Body() nutriment: CreateNutrimentsDto) {
    return this.nutrimentsService.createNutriment(nutriment);
  }

}
