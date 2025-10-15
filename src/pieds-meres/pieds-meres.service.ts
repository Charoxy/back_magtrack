import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PiedMere } from '../entities/entitie.pied-mere';
import { Lot } from '../entities/entitie.lots';
import { EvaluationPlant } from '../entities/entitie.evaluation-plant';
import { LotAction } from '../entities/entitie.lots-action';
import { CreatePiedMereDto, UpdatePiedMereDto, ChangeStatutDto } from '../dto/create-pied-mere.dto';

@Injectable()
export class PiedsMeresService {

  constructor(
    @InjectRepository(PiedMere)
    private readonly piedMereRepository: Repository<PiedMere>,

    @InjectRepository(Lot)
    private readonly lotRepository: Repository<Lot>,

    @InjectRepository(EvaluationPlant)
    private readonly evaluationRepository: Repository<EvaluationPlant>,

    @InjectRepository(LotAction)
    private readonly lotActionRepository: Repository<LotAction>,
  ) {}

  // Générer un code unique pour le pied mère
  private async generateCode(): Promise<string> {
    const count = await this.piedMereRepository.count();
    const code = `PM-${String(count + 1).padStart(3, '0')}`;

    // Vérifier l'unicité
    const existing = await this.piedMereRepository.findOne({ where: { code } });
    if (existing) {
      // Si le code existe déjà, essayer avec +1
      return `PM-${String(count + 2).padStart(3, '0')}`;
    }

    return code;
  }

  async create(dto: CreatePiedMereDto, userId: number): Promise<PiedMere> {
    // Vérifier que le lot de clones test appartient à l'utilisateur
    const lotClonesTest = await this.lotRepository.findOne({
      where: { id: dto.lotClonesTestId, userId },
      relations: ['variete']
    });

    if (!lotClonesTest) {
      throw new NotFoundException('Lot de clones test non trouvé ou accès refusé');
    }

    // Vérifier que c'est bien un lot de clones test
    if (lotClonesTest.origine !== 'clone_test') {
      throw new BadRequestException('Le lot spécifié n\'est pas un lot de clones test');
    }

    // Vérifier que le plantIndex est valide
    if (dto.plantIndex < 1 || dto.plantIndex > lotClonesTest.planteQuantite) {
      throw new BadRequestException(`Le plantIndex doit être entre 1 et ${lotClonesTest.planteQuantite}`);
    }

    // Vérifier que le lot de graines appartient à l'utilisateur
    const lotGraines = await this.lotRepository.findOne({
      where: { id: dto.lotGrainesId, userId }
    });

    if (!lotGraines) {
      throw new NotFoundException('Lot de graines non trouvé ou accès refusé');
    }

    // Vérifier que le plantGrainesIndex est valide
    if (dto.plantGrainesIndex < 1 || dto.plantGrainesIndex > lotGraines.planteQuantite) {
      throw new BadRequestException(`Le plantGrainesIndex doit être entre 1 et ${lotGraines.planteQuantite}`);
    }

    // Générer le code unique
    const code = await this.generateCode();

    // Créer d'abord le Lot pour le pied mère
    const lot = this.lotRepository.create({
      nom: `PM - ${dto.nom}`,
      description: dto.description || `Pied mère créé depuis le clone test ${lotClonesTest.nom}`,
      variete: lotClonesTest.variete,
      dateDebut: new Date(),
      planteQuantite: 1, // Un pied mère = 1 plante
      userId,
      etapeCulture: 'Croissance',
      origine: 'pied_mere',
      substrat: lotClonesTest.substrat,
      generation: (lotClonesTest.generation || 0) + 1,
    });

    const savedLot = await this.lotRepository.save(lot);

    // Créer l'action de stage pour le lot
    const stageAction = new LotAction();
    stageAction.lotId = savedLot.id;
    stageAction.type = 'stage';
    stageAction.description = 'Création du pied mère en phase de croissance';
    stageAction.date = new Date();
    stageAction.stage = 'croissance';
    await this.lotActionRepository.save(stageAction);

    // Créer le pied mère
    const piedMere = this.piedMereRepository.create({
      nom: dto.nom,
      code,
      varieteId: lotClonesTest.variete.id,
      userId,
      lotOrigineId: dto.lotClonesTestId,
      plantIndex: dto.plantIndex,
      lotGrainesId: dto.lotGrainesId,
      plantGrainesIndex: dto.plantGrainesIndex,
      environnementId: dto.environnementId,
      description: dto.description || '',
      caracteristiques: dto.caracteristiques || null,
      statut: 'actif',
      nombreClonesPrelevés: 0,
      lotId: savedLot.id, // Lier le lot au pied mère
    });

    // Si une évaluation est fournie, copier les notes
    if (dto.evaluationId) {
      const evaluation = await this.evaluationRepository.findOne({
        where: { id: dto.evaluationId, userId }
      });

      if (evaluation) {
        piedMere.noteGlobale = evaluation.noteGlobale;
        piedMere.notePuissance = evaluation.notePuissance;
        piedMere.noteGout = evaluation.noteGout;
        piedMere.noteRendement = evaluation.noteRendement;
        piedMere.poidsRecolte = evaluation.poidsRecolte;
        piedMere.tauxTHC = evaluation.tauxTHC;
        piedMere.tauxCBD = evaluation.tauxCBD;

        // Marquer l'évaluation comme sélectionnée
        evaluation.selectionne = true;
        evaluation.piedMereId = piedMere.id;
        await this.evaluationRepository.save(evaluation);
      }
    }

    const saved = await this.piedMereRepository.save(piedMere);

    // Mettre à jour le statut du lot de clones test
    lotClonesTest.enAttenteSelection = false;
    await this.lotRepository.save(lotClonesTest);

    return saved;
  }

  async findAll(userId: number, filters?: { statut?: string; varieteId?: number; search?: string }): Promise<PiedMere[]> {
    const query = this.piedMereRepository.createQueryBuilder('pm')
      .leftJoinAndSelect('pm.variete', 'variete')
      .leftJoinAndSelect('pm.environnement', 'environnement')
      .leftJoinAndSelect('pm.lot', 'lot')
      .where('pm.userId = :userId', { userId });

    if (filters?.statut && filters.statut !== 'tous') {
      query.andWhere('pm.statut = :statut', { statut: filters.statut });
    }

    if (filters?.varieteId) {
      query.andWhere('pm.varieteId = :varieteId', { varieteId: filters.varieteId });
    }

    if (filters?.search) {
      query.andWhere('(pm.nom LIKE :search OR pm.code LIKE :search)', { search: `%${filters.search}%` });
    }

    query.orderBy('pm.dateCreation', 'DESC');

    return await query.getMany();
  }

  async findOne(id: number, userId: number): Promise<PiedMere> {
    const piedMere = await this.piedMereRepository.findOne({
      where: { id },
      relations: ['variete', 'environnement', 'lot']
    });

    if (!piedMere) {
      throw new NotFoundException('Pied mère non trouvé');
    }

    if (piedMere.userId !== userId) {
      throw new ForbiddenException('Accès refusé');
    }

    return piedMere;
  }

  async update(id: number, dto: UpdatePiedMereDto, userId: number): Promise<PiedMere> {
    const piedMere = await this.findOne(id, userId);

    if (dto.nom) piedMere.nom = dto.nom;
    if (dto.environnementId) piedMere.environnementId = dto.environnementId;
    if (dto.description !== undefined) piedMere.description = dto.description;
    if (dto.caracteristiques !== undefined) piedMere.caracteristiques = dto.caracteristiques;

    return await this.piedMereRepository.save(piedMere);
  }

  async changeStatut(id: number, dto: ChangeStatutDto, userId: number): Promise<PiedMere> {
    const piedMere = await this.findOne(id, userId);

    piedMere.statut = dto.statut;

    if (dto.statut === 'retiré') {
      piedMere.dateRetrait = new Date();
    } else {
      piedMere.dateRetrait = null;
    }

    return await this.piedMereRepository.save(piedMere);
  }

  async remove(id: number, userId: number): Promise<void> {
    const piedMere = await this.findOne(id, userId);
    await this.piedMereRepository.remove(piedMere);
  }

  async getStats(id: number, userId: number): Promise<any> {
    const piedMere = await this.findOne(id, userId);

    const lots = await this.lotRepository.find({
      where: { piedMereId: id }
    });

    const lotsActifs = lots.filter(l => !l.dateFin || l.dateFin === null).length;
    const lotsTermines = lots.filter(l => l.dateFin !== null).length;
    const totalPlantesProduites = lots.reduce((sum, lot) => sum + lot.planteQuantite, 0);
    const rendementTotal = lots.reduce((sum, lot) => sum + (lot.quantite || 0), 0);
    const rendementMoyen = lotsTermines > 0 ? rendementTotal / lotsTermines : 0;

    const ageJours = Math.floor((new Date().getTime() - new Date(piedMere.dateCreation).getTime()) / (1000 * 60 * 60 * 24));

    return {
      piedMereId: piedMere.id,
      nom: piedMere.nom,
      totalClones: piedMere.nombreClonesPrelevés,
      lotsCreés: lots.length,
      totalPlantesProduites,
      rendementTotal,
      rendementMoyen,
      lotsActifs,
      lotsTermines,
      ageJours,
      derniereUtilisation: piedMere.dernierPrelevement,
    };
  }

  async getClones(id: number, userId: number): Promise<Lot[]> {
    await this.findOne(id, userId);

    return await this.lotRepository.find({
      where: { piedMereId: id },
      relations: ['variete'],
      order: { dateDebut: 'DESC' }
    });
  }

  async getGenealogy(id: number, userId: number): Promise<any> {
    const piedMere = await this.findOne(id, userId);

    const lotGraines = await this.lotRepository.findOne({
      where: { id: piedMere.lotGrainesId }
    });

    const lotClonesTest = await this.lotRepository.findOne({
      where: { id: piedMere.lotOrigineId }
    });

    const evaluation = await this.evaluationRepository.findOne({
      where: { piedMereId: id }
    });

    const lotsProduction = await this.getClones(id, userId);

    return {
      piedMere,
      lotGraines: lotGraines ? {
        id: lotGraines.id,
        nom: lotGraines.nom,
        dateDebut: lotGraines.dateDebut,
        plantIndex: piedMere.plantGrainesIndex
      } : null,
      lotClonesTest: lotClonesTest ? {
        id: lotClonesTest.id,
        nom: lotClonesTest.nom,
        dateCreation: lotClonesTest.createdAt,
        plantIndex: piedMere.plantIndex
      } : null,
      evaluation,
      lotsProduction: lotsProduction.map(lot => ({
        id: lot.id,
        nom: lot.nom,
        dateDebut: lot.dateDebut,
        planteQuantite: lot.planteQuantite,
        etapeCulture: lot.etapeCulture
      }))
    };
  }

  async getActions(id: number, userId: number): Promise<LotAction[]> {
    const piedMere = await this.findOne(id, userId);

    if (!piedMere.lotId) {
      throw new NotFoundException('Aucun lot associé à ce pied mère');
    }

    return await this.lotActionRepository.find({
      where: { lotId: piedMere.lotId },
      order: { date: 'DESC' }
    });
  }

  async findByLotId(lotId: number, userId: number): Promise<PiedMere> {
    // Vérifier que le lot appartient à l'utilisateur
    const lot = await this.lotRepository.findOne({
      where: { id: lotId, userId }
    });

    if (!lot) {
      throw new NotFoundException('Lot non trouvé ou accès refusé');
    }

    // Vérifier que c'est bien un lot de type pied mère
    if (lot.origine !== 'pied_mere') {
      throw new BadRequestException('Ce lot n\'est pas un pied mère');
    }

    // Trouver le pied mère associé
    const piedMere = await this.piedMereRepository.findOne({
      where: { lotId, userId },
      relations: ['variete', 'environnement', 'lot']
    });

    if (!piedMere) {
      throw new NotFoundException('Pied mère introuvable pour ce lot');
    }

    return piedMere;
  }
}
