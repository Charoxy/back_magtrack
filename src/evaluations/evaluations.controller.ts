import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EvaluationsService } from './evaluations.service';
import { CreateEvaluationDto, CreateBulkEvaluationsDto, UpdateEvaluationDto } from '../dto/create-evaluation.dto';
import { AuthGuard } from '../auth/auth.guard';

@ApiTags('evaluations')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('evaluations')
export class EvaluationsController {
  constructor(private readonly evaluationsService: EvaluationsService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une évaluation pour une plante' })
  @ApiResponse({ status: 201, description: 'Évaluation créée avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides ou évaluation déjà existante' })
  @ApiResponse({ status: 403, description: 'Accès non autorisé' })
  @ApiResponse({ status: 404, description: 'Lot introuvable' })
  create(@Body() createEvaluationDto: CreateEvaluationDto, @Req() req: any) {
    return this.evaluationsService.create(createEvaluationDto, req.user.sub);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Créer plusieurs évaluations en une seule fois' })
  @ApiResponse({ status: 201, description: 'Évaluations créées avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides ou évaluations déjà existantes' })
  @ApiResponse({ status: 403, description: 'Accès non autorisé' })
  @ApiResponse({ status: 404, description: 'Lot introuvable' })
  createBulk(@Body() createBulkDto: CreateBulkEvaluationsDto, @Req() req: any) {
    return this.evaluationsService.createBulk(createBulkDto, req.user.sub);
  }

  @Get('lot/:lotId')
  @ApiOperation({ summary: 'Obtenir toutes les évaluations d\'un lot' })
  @ApiResponse({ status: 200, description: 'Liste des évaluations' })
  @ApiResponse({ status: 403, description: 'Accès non autorisé' })
  @ApiResponse({ status: 404, description: 'Lot introuvable' })
  findByLot(@Param('lotId', ParseIntPipe) lotId: number, @Req() req: any) {
    return this.evaluationsService.findByLot(lotId, req.user.sub);
  }

  @Get('lot/:lotId/statut-selection')
  @ApiOperation({ summary: 'Obtenir le statut de sélection d\'un lot de clones test' })
  @ApiResponse({ status: 200, description: 'Statut de sélection du lot' })
  @ApiResponse({ status: 400, description: 'Le lot n\'est pas un lot de clones test' })
  @ApiResponse({ status: 403, description: 'Accès non autorisé' })
  @ApiResponse({ status: 404, description: 'Lot introuvable' })
  getStatutSelection(@Param('lotId', ParseIntPipe) lotId: number, @Req() req: any) {
    return this.evaluationsService.getStatutSelection(lotId, req.user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir les détails d\'une évaluation' })
  @ApiResponse({ status: 200, description: 'Détails de l\'évaluation' })
  @ApiResponse({ status: 403, description: 'Accès non autorisé' })
  @ApiResponse({ status: 404, description: 'Évaluation introuvable' })
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.evaluationsService.findOne(id, req.user.sub);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier une évaluation' })
  @ApiResponse({ status: 200, description: 'Évaluation modifiée avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides ou plante déjà transformée en pied mère' })
  @ApiResponse({ status: 403, description: 'Accès non autorisé' })
  @ApiResponse({ status: 404, description: 'Évaluation introuvable' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEvaluationDto: UpdateEvaluationDto,
    @Req() req: any,
  ) {
    return this.evaluationsService.update(id, updateEvaluationDto, req.user.sub);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une évaluation' })
  @ApiResponse({ status: 200, description: 'Évaluation supprimée avec succès' })
  @ApiResponse({ status: 400, description: 'Plante déjà transformée en pied mère' })
  @ApiResponse({ status: 403, description: 'Accès non autorisé' })
  @ApiResponse({ status: 404, description: 'Évaluation introuvable' })
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.evaluationsService.remove(id, req.user.sub);
  }
}
