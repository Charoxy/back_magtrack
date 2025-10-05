import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query, Request, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiCookieAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { LotsService } from "./lots.service";
import { CreateLotDto } from "../dto/lotsmake.dto";
import { AuthGuard } from "../auth/auth.guard";
import { CreateLotActionDto } from "../dto/create-lot-action.dto";
import { ChangeEnvDTO } from "../dto/change-env.dto";
import { CreateShareLots } from "src/dto/create-share-lots";
import { UpdateLotQuantityDto } from "src/dto/update-lot-quantity.dto";

@ApiTags('Lots')
@ApiCookieAuth()
@UseGuards(AuthGuard)
@Controller('lots')
export class LotsController {

  constructor(
    private readonly lotsService: LotsService,
  ) { }

  @Post()
  @ApiOperation({ summary: 'Créer un nouveau lot' })
  @ApiResponse({
    status: 201,
    description: 'Lot créé avec succès',
    schema: {
      example: {
        id: 1,
        nom: 'Purple Haze #1',
        dateDebut: '2024-01-15',
        planteQuantite: 10,
        etapeCulture: 'Croissance',
        variete: { id: 1, nom: 'Purple Haze' }
      }
    }
  })
  createLot(@Request() req, @Body() lot: CreateLotDto) {
    return this.lotsService.createLot(lot, req.user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les lots de l\'utilisateur' })
  @ApiResponse({
    status: 200,
    description: 'Liste de tous les lots',
    schema: {
      example: [{
        id: 1,
        nom: 'Purple Haze #1',
        etapeCulture: 'Floraison',
        planteQuantite: 10,
        dateDebut: '2024-01-15',
        variete: { nom: 'Purple Haze', type: 'Indica' }
      }]
    }
  })
  getAllLots(@Request() req) {
    return this.lotsService.findAll(req.user.sub);
  }

  @Get('view/:id')
  @ApiOperation({ summary: 'Récupérer un lot par son ID' })
  @ApiParam({ name: 'id', description: 'ID du lot' })
  @ApiResponse({ status: 200, description: 'Détails du lot' })
  @ApiResponse({ status: 404, description: 'Lot non trouvé' })
  async getLotById(@Request() req, @Param('id') id: number) {
    const find = await this.lotsService.findOne(id, req.user.sub);
    return find;
  }

  @Get('actif')
  @ApiOperation({ summary: 'Récupérer les lots actifs (non terminés)' })
  @ApiResponse({ status: 200, description: 'Liste des lots actifs' })
  getActifLots(@Request() req) {
    return this.lotsService.findActif(req.user.sub);
  }

  @Get('old')
  @ApiOperation({ summary: 'Récupérer les lots terminés' })
  @ApiResponse({ status: 200, description: 'Liste des lots terminés' })
  getOldLots(@Request() req) {
    return this.lotsService.findOld(req.user.sub);
  }

  @Get('actions/:id')
  @ApiOperation({ summary: 'Récupérer toutes les actions d\'un lot' })
  @ApiParam({ name: 'id', description: 'ID du lot' })
  @ApiResponse({
    status: 200,
    description: 'Liste des actions',
    schema: {
      example: [{
        id: 1,
        type: 'arrosage',
        description: 'Arrosage 5L',
        date: '2024-01-20',
        quantity: 5,
        unit: 'L'
      }]
    }
  })
  getActions(@Request() req, @Param('id') id: number) {
    return this.lotsService.getActions(id, req.user.sub);
  }

  @Post('actions/:id')
  @ApiOperation({ summary: 'Ajouter une action à un lot' })
  @ApiParam({ name: 'id', description: 'ID du lot' })
  @ApiResponse({ status: 201, description: 'Action ajoutée avec succès' })
  addAction(@Request() req, @Param('id') id: number, @Body() action: CreateLotActionDto) {
    return this.lotsService.addAction(id, action, req.user.sub);
  }

  @HttpCode(HttpStatus.OK)
  @Delete('actions/:id')
  @ApiOperation({ summary: 'Supprimer une action' })
  @ApiParam({ name: 'id', description: 'ID de l\'action' })
  @ApiResponse({ status: 200, description: 'Action supprimée' })
  deleteAction(@Request() req, @Param('id') id: number) {
    return this.lotsService.deleteAction(id, req.user.sub);
  }

  @Get('stageWithDays/:id')
  @ApiOperation({ summary: 'Récupérer l\'étape de culture avec le nombre de jours' })
  @ApiParam({ name: 'id', description: 'ID du lot' })
  @ApiQuery({ name: 'date', required: false, description: 'Date de référence (ISO)' })
  @ApiResponse({ status: 200, description: 'Étape et durée' })
  getStage(@Request() req, @Param('id') id: number, @Query('date') date: string) {
    return this.lotsService.getStage(id, req.user.sub, new Date(date));
  }

  @Post('share-lots')
  @ApiOperation({ summary: 'Créer un lien de partage public pour un lot' })
  @ApiResponse({
    status: 201,
    description: 'Lien de partage créé',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        lotId: 1,
        createdAt: '2024-01-20T10:00:00Z'
      }
    }
  })
  makeShareLot(@Request() req, @Body() shareLot: CreateShareLots) {
    return this.lotsService.makeShareLot(shareLot, req.user.sub);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Récupérer les statistiques globales des lots' })
  @ApiResponse({
    status: 200,
    description: 'Statistiques',
    schema: {
      example: {
        totalLots: 15,
        lotsActifs: 8,
        lotsTermines: 7,
        totalPlantes: 120,
        rendementTotal: 2500.5
      }
    }
  })
  getStatistics(@Request() req) {
    return this.lotsService.getStatistics(req.user.sub);
  }

  @Get('recent-activities')
  @ApiOperation({ summary: 'Récupérer les activités récentes' })
  @ApiResponse({ status: 200, description: 'Liste des activités récentes' })
  getRecentActivities(@Request() req) {
    return this.lotsService.getRecentActivities(req.user.sub);
  }

  @Get('culture-evolution')
  @ApiOperation({ summary: 'Récupérer l\'évolution des cultures' })
  @ApiResponse({ status: 200, description: 'Données d\'évolution' })
  getCultureEvolution(@Request() req) {
    return this.lotsService.getCultureEvolution(req.user.sub);
  }

  @Put(':id/quantity')
  @ApiOperation({ summary: 'Mettre à jour la quantité récoltée d\'un lot' })
  @ApiParam({ name: 'id', description: 'ID du lot' })
  @ApiResponse({ status: 200, description: 'Quantité mise à jour' })
  updateLotQuantity(@Request() req, @Param('id') id: number, @Body() updateQuantityDto: UpdateLotQuantityDto) {
    return this.lotsService.updateLotQuantity(id, updateQuantityDto.quantite, req.user.sub);
  }


  @Get('maturation')
  @ApiOperation({ summary: 'Récupérer les lots en maturation' })
  @ApiResponse({ status: 200, description: 'Liste des lots en maturation' })
  getMaturationLots(@Request() req) {
    return this.lotsService.getMaturationLots(req.user.sub);
  }


}
