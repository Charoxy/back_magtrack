import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PiedsMeresService } from './pieds-meres.service';
import { CreatePiedMereDto, UpdatePiedMereDto, ChangeStatutDto } from '../dto/create-pied-mere.dto';
import { AuthGuard } from '../auth/auth.guard';

@ApiTags('pieds-meres')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('pieds-meres')
export class PiedsMeresController {
  constructor(private readonly piedsMeresService: PiedsMeresService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un pied mère à partir d\'un clone sélectionné' })
  @ApiResponse({ status: 201, description: 'Pied mère créé avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 403, description: 'Accès non autorisé' })
  @ApiResponse({ status: 404, description: 'Lot ou évaluation introuvable' })
  create(@Body() createPiedMereDto: CreatePiedMereDto, @Req() req: any) {
    return this.piedsMeresService.create(createPiedMereDto, req.user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Lister tous les pieds mères de l\'utilisateur' })
  @ApiQuery({ name: 'statut', required: false, enum: ['actif', 'repos', 'retiré'] })
  @ApiQuery({ name: 'varieteId', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Liste des pieds mères' })
  findAll(
    @Req() req: any,
    @Query('statut') statut?: string,
    @Query('varieteId') varieteId?: number,
    @Query('search') search?: string,
  ) {
    return this.piedsMeresService.findAll(req.user.sub, { statut, varieteId, search });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir les détails d\'un pied mère' })
  @ApiResponse({ status: 200, description: 'Détails du pied mère' })
  @ApiResponse({ status: 403, description: 'Accès non autorisé' })
  @ApiResponse({ status: 404, description: 'Pied mère introuvable' })
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.piedsMeresService.findOne(id, req.user.sub);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Obtenir les statistiques de production d\'un pied mère' })
  @ApiResponse({ status: 200, description: 'Statistiques du pied mère' })
  @ApiResponse({ status: 403, description: 'Accès non autorisé' })
  @ApiResponse({ status: 404, description: 'Pied mère introuvable' })
  getStats(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.piedsMeresService.getStats(id, req.user.sub);
  }

  @Get(':id/clones')
  @ApiOperation({ summary: 'Lister tous les lots créés à partir de ce pied mère' })
  @ApiResponse({ status: 200, description: 'Liste des lots de production' })
  @ApiResponse({ status: 403, description: 'Accès non autorisé' })
  @ApiResponse({ status: 404, description: 'Pied mère introuvable' })
  getClones(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.piedsMeresService.getClones(id, req.user.sub);
  }

  @Get(':id/genealogy')
  @ApiOperation({ summary: 'Obtenir la généalogie complète du pied mère' })
  @ApiResponse({ status: 200, description: 'Arbre généalogique complet' })
  @ApiResponse({ status: 403, description: 'Accès non autorisé' })
  @ApiResponse({ status: 404, description: 'Pied mère introuvable' })
  getGenealogy(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.piedsMeresService.getGenealogy(id, req.user.sub);
  }

  @Get(':id/actions')
  @ApiOperation({ summary: 'Obtenir l\'historique des actions du lot associé au pied mère' })
  @ApiResponse({ status: 200, description: 'Historique des actions' })
  @ApiResponse({ status: 403, description: 'Accès non autorisé' })
  @ApiResponse({ status: 404, description: 'Pied mère ou lot introuvable' })
  getActions(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.piedsMeresService.getActions(id, req.user.sub);
  }

  @Get('by-lot/:lotId')
  @ApiOperation({ summary: 'Récupérer un pied mère à partir de l\'ID du lot associé' })
  @ApiResponse({ status: 200, description: 'Pied mère trouvé' })
  @ApiResponse({ status: 403, description: 'Accès non autorisé' })
  @ApiResponse({ status: 404, description: 'Pied mère introuvable pour ce lot' })
  getByLotId(@Param('lotId', ParseIntPipe) lotId: number, @Req() req: any) {
    return this.piedsMeresService.findByLotId(lotId, req.user.sub);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier les informations d\'un pied mère' })
  @ApiResponse({ status: 200, description: 'Pied mère modifié avec succès' })
  @ApiResponse({ status: 403, description: 'Accès non autorisé' })
  @ApiResponse({ status: 404, description: 'Pied mère introuvable' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePiedMereDto: UpdatePiedMereDto,
    @Req() req: any,
  ) {
    return this.piedsMeresService.update(id, updatePiedMereDto, req.user.sub);
  }

  @Patch(':id/statut')
  @ApiOperation({ summary: 'Changer le statut d\'un pied mère' })
  @ApiResponse({ status: 200, description: 'Statut modifié avec succès' })
  @ApiResponse({ status: 400, description: 'Statut invalide' })
  @ApiResponse({ status: 403, description: 'Accès non autorisé' })
  @ApiResponse({ status: 404, description: 'Pied mère introuvable' })
  changeStatut(
    @Param('id', ParseIntPipe) id: number,
    @Body() changeStatutDto: ChangeStatutDto,
    @Req() req: any,
  ) {
    return this.piedsMeresService.changeStatut(id, changeStatutDto, req.user.sub);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un pied mère' })
  @ApiResponse({ status: 200, description: 'Pied mère supprimé avec succès' })
  @ApiResponse({ status: 403, description: 'Accès non autorisé' })
  @ApiResponse({ status: 404, description: 'Pied mère introuvable' })
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.piedsMeresService.remove(id, req.user.sub);
  }
}
