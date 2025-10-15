import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EvaluationPlant } from '../entities/entitie.evaluation-plant';
import { Lot } from '../entities/entitie.lots';
import { CreateEvaluationDto, CreateBulkEvaluationsDto, UpdateEvaluationDto } from '../dto/create-evaluation.dto';

@Injectable()
export class EvaluationsService {
  constructor(
    @InjectRepository(EvaluationPlant)
    private evaluationRepository: Repository<EvaluationPlant>,
    @InjectRepository(Lot)
    private lotRepository: Repository<Lot>,
  ) {}

  async create(createEvaluationDto: CreateEvaluationDto, userId: number): Promise<EvaluationPlant> {
    const { lotId, plantIndex, ...evaluationData } = createEvaluationDto;

    // Verify lot ownership and type
    const lot = await this.lotRepository.findOne({
      where: { id: lotId },
      relations: ['user'],
    });

    if (!lot) {
      throw new NotFoundException(`Lot avec l'ID ${lotId} introuvable`);
    }

    if (lot.userId !== userId) {
      throw new ForbiddenException('Accès non autorisé à ce lot');
    }

    if (lot.origine !== 'clone_test') {
      throw new BadRequestException('Les évaluations ne peuvent être créées que pour des lots de clones test');
    }

    // Check if evaluation already exists for this plant
    const existing = await this.evaluationRepository.findOne({
      where: { lotId, plantIndex },
    });

    if (existing) {
      throw new BadRequestException(`Une évaluation existe déjà pour la plante #${plantIndex} du lot ${lotId}`);
    }

    // Validate plant index
    if (plantIndex < 1 || plantIndex > 16) {
      throw new BadRequestException('L\'index de la plante doit être entre 1 et 16');
    }

    // Validate note globale (required)
    if (evaluationData.noteGlobale < 0 || evaluationData.noteGlobale > 10) {
      throw new BadRequestException('La note globale doit être entre 0 et 10');
    }

    // Validate optional notes
    if (evaluationData.notePuissance !== undefined && (evaluationData.notePuissance < 0 || evaluationData.notePuissance > 10)) {
      throw new BadRequestException('La note de puissance doit être entre 0 et 10');
    }
    if (evaluationData.noteGout !== undefined && (evaluationData.noteGout < 0 || evaluationData.noteGout > 10)) {
      throw new BadRequestException('La note de goût doit être entre 0 et 10');
    }
    if (evaluationData.noteRendement !== undefined && (evaluationData.noteRendement < 0 || evaluationData.noteRendement > 10)) {
      throw new BadRequestException('La note de rendement doit être entre 0 et 10');
    }

    const evaluation = this.evaluationRepository.create({
      lotId,
      plantIndex,
      userId,
      ...evaluationData,
    });

    return this.evaluationRepository.save(evaluation);
  }

  async createBulk(createBulkDto: CreateBulkEvaluationsDto, userId: number): Promise<EvaluationPlant[]> {
    const { lotId, evaluations } = createBulkDto;

    // Verify lot ownership and type
    const lot = await this.lotRepository.findOne({
      where: { id: lotId },
      relations: ['user'],
    });

    if (!lot) {
      throw new NotFoundException(`Lot avec l'ID ${lotId} introuvable`);
    }

    if (lot.userId !== userId) {
      throw new ForbiddenException('Accès non autorisé à ce lot');
    }

    if (lot.origine !== 'clone_test') {
      throw new BadRequestException('Les évaluations ne peuvent être créées que pour des lots de clones test');
    }

    // Check for duplicate plant indexes
    const plantIndexes = evaluations.map(e => e.plantIndex);
    const uniqueIndexes = new Set(plantIndexes);
    if (uniqueIndexes.size !== plantIndexes.length) {
      throw new BadRequestException('Chaque plante ne peut être évaluée qu\'une seule fois');
    }

    // Check if any evaluations already exist
    const existingEvaluations = await this.evaluationRepository.find({
      where: { lotId },
    });

    const existingIndexes = new Set(existingEvaluations.map(e => e.plantIndex));
    const conflicts = plantIndexes.filter(idx => existingIndexes.has(idx));

    if (conflicts.length > 0) {
      throw new BadRequestException(`Des évaluations existent déjà pour les plantes: ${conflicts.join(', ')}`);
    }

    // Validate all plant indexes and notes
    for (const evalData of evaluations) {
      if (evalData.plantIndex < 1 || evalData.plantIndex > 16) {
        throw new BadRequestException(`L'index de la plante doit être entre 1 et 16 (reçu: ${evalData.plantIndex})`);
      }
      if (evalData.noteGlobale < 0 || evalData.noteGlobale > 10) {
        throw new BadRequestException(`La note globale doit être entre 0 et 10 pour la plante #${evalData.plantIndex}`);
      }
      if (evalData.notePuissance !== undefined && (evalData.notePuissance < 0 || evalData.notePuissance > 10)) {
        throw new BadRequestException(`La note de puissance doit être entre 0 et 10 pour la plante #${evalData.plantIndex}`);
      }
      if (evalData.noteGout !== undefined && (evalData.noteGout < 0 || evalData.noteGout > 10)) {
        throw new BadRequestException(`La note de goût doit être entre 0 et 10 pour la plante #${evalData.plantIndex}`);
      }
      if (evalData.noteRendement !== undefined && (evalData.noteRendement < 0 || evalData.noteRendement > 10)) {
        throw new BadRequestException(`La note de rendement doit être entre 0 et 10 pour la plante #${evalData.plantIndex}`);
      }
    }

    // Create all evaluations
    const evaluationEntities = evaluations.map(evalData =>
      this.evaluationRepository.create({
        lotId,
        userId,
        ...evalData,
      })
    );

    return this.evaluationRepository.save(evaluationEntities);
  }

  async findByLot(lotId: number, userId: number): Promise<EvaluationPlant[]> {
    // Verify lot ownership
    const lot = await this.lotRepository.findOne({
      where: { id: lotId },
    });

    if (!lot) {
      throw new NotFoundException(`Lot avec l'ID ${lotId} introuvable`);
    }

    if (lot.userId !== userId) {
      throw new ForbiddenException('Accès non autorisé à ce lot');
    }

    return this.evaluationRepository.find({
      where: { lotId },
      relations: ['piedMere'],
      order: { plantIndex: 'ASC' },
    });
  }

  async findOne(id: number, userId: number): Promise<EvaluationPlant> {
    const evaluation = await this.evaluationRepository.findOne({
      where: { id },
      relations: ['lot', 'piedMere'],
    });

    if (!evaluation) {
      throw new NotFoundException(`Évaluation avec l'ID ${id} introuvable`);
    }

    if (evaluation.userId !== userId) {
      throw new ForbiddenException('Accès non autorisé à cette évaluation');
    }

    return evaluation;
  }

  async update(id: number, updateEvaluationDto: UpdateEvaluationDto, userId: number): Promise<EvaluationPlant> {
    const evaluation = await this.evaluationRepository.findOne({
      where: { id },
      relations: ['piedMere'],
    });

    if (!evaluation) {
      throw new NotFoundException(`Évaluation avec l'ID ${id} introuvable`);
    }

    if (evaluation.userId !== userId) {
      throw new ForbiddenException('Accès non autorisé à cette évaluation');
    }

    // If evaluation has been selected (has piedMere), prevent major modifications
    if (evaluation.piedMereId) {
      throw new BadRequestException('Cette plante a été transformée en pied mère. Modification limitée.');
    }

    // Validate notes if provided
    if (updateEvaluationDto.noteGlobale !== undefined && (updateEvaluationDto.noteGlobale < 0 || updateEvaluationDto.noteGlobale > 10)) {
      throw new BadRequestException('La note globale doit être entre 0 et 10');
    }
    if (updateEvaluationDto.notePuissance !== undefined && (updateEvaluationDto.notePuissance < 0 || updateEvaluationDto.notePuissance > 10)) {
      throw new BadRequestException('La note de puissance doit être entre 0 et 10');
    }
    if (updateEvaluationDto.noteGout !== undefined && (updateEvaluationDto.noteGout < 0 || updateEvaluationDto.noteGout > 10)) {
      throw new BadRequestException('La note de goût doit être entre 0 et 10');
    }
    if (updateEvaluationDto.noteRendement !== undefined && (updateEvaluationDto.noteRendement < 0 || updateEvaluationDto.noteRendement > 10)) {
      throw new BadRequestException('La note de rendement doit être entre 0 et 10');
    }

    Object.assign(evaluation, updateEvaluationDto);

    return this.evaluationRepository.save(evaluation);
  }

  async remove(id: number, userId: number): Promise<void> {
    const evaluation = await this.evaluationRepository.findOne({
      where: { id },
      relations: ['piedMere'],
    });

    if (!evaluation) {
      throw new NotFoundException(`Évaluation avec l'ID ${id} introuvable`);
    }

    if (evaluation.userId !== userId) {
      throw new ForbiddenException('Accès non autorisé à cette évaluation');
    }

    // Prevent deletion if evaluation has been selected
    if (evaluation.piedMereId) {
      throw new BadRequestException('Cette plante a été transformée en pied mère. Suppression impossible.');
    }

    await this.evaluationRepository.remove(evaluation);
  }

  async getStatutSelection(lotId: number, userId: number): Promise<any> {
    // Verify lot ownership
    const lot = await this.lotRepository.findOne({
      where: { id: lotId },
    });

    if (!lot) {
      throw new NotFoundException(`Lot avec l'ID ${lotId} introuvable`);
    }

    if (lot.userId !== userId) {
      throw new ForbiddenException('Accès non autorisé à ce lot');
    }

    if (lot.origine !== 'clone_test') {
      throw new BadRequestException('Ce statut n\'est disponible que pour les lots de clones test');
    }

    const evaluations = await this.evaluationRepository.find({
      where: { lotId },
      relations: ['piedMere'],
      order: { plantIndex: 'ASC' },
    });

    const totalPlantes = 16; // Standard clone test lot size
    const evaluees = evaluations.length;
    const selectionnes = evaluations.filter(e => e.selectionne).length;
    const piedsMeresCrees = evaluations.filter(e => e.piedMereId).length;

    return {
      lotId,
      enAttenteSelection: lot.enAttenteSelection,
      totalPlantes,
      evaluees,
      nonEvaluees: totalPlantes - evaluees,
      selectionnes,
      piedsMeresCrees,
      evaluations: evaluations.map(e => ({
        id: e.id,
        plantIndex: e.plantIndex,
        noteGlobale: e.noteGlobale,
        selectionne: e.selectionne,
        piedMereId: e.piedMereId,
        piedMereCode: e.piedMere?.code,
      })),
    };
  }
}
