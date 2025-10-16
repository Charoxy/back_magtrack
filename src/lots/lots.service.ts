import { ForbiddenException, HttpCode, HttpException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { Lot } from "../entities/entitie.lots";
import { IsNull, Not, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateLotDto } from "../dto/lotsmake.dto";
import { VarieteService } from "../variete/variete.service";
import { EnvironmentsService } from 'src/environments/environments.service';
import { EnvironnementLot } from "../entities/entitie.environement-lot";
import { ConditionEnvironnementale } from "../entities/entitie.condition-environnementale";
import { UsersService } from "../users/users.service";
import { LotAction } from "../entities/entitie.lots-action";
import { CreateLotActionDto } from "../dto/create-lot-action.dto";
import { NutrimentAction } from "../entities/entitie.nutriments-action";
import { ChangeEnvDTO } from "../dto/change-env.dto";
import { ShareLots } from "src/entities/entitie.share-lots";
import { CreateShareLots } from "src/dto/create-share-lots";
import { link } from "fs";
import { PrelevementClonesTestDto, CreateLotFromMotherDto } from "../dto/prelevement-clones-test.dto";
import { PiedMere } from "../entities/entitie.pied-mere";

@Injectable()
export class LotsService {

  constructor(
    @InjectRepository(Lot)
    private readonly lotRepository: Repository<Lot>,

    @InjectRepository(LotAction)
    private readonly lotActionRepository: Repository<LotAction>,

    @InjectRepository(ShareLots)
    private readonly shareLotsRepository: Repository<ShareLots>,

    @InjectRepository(EnvironnementLot)
    private readonly environnementLotRepository: Repository<EnvironnementLot>,

    @InjectRepository(ConditionEnvironnementale)
    private readonly conditionEnvironnementaleRepository: Repository<ConditionEnvironnementale>,

    @InjectRepository(PiedMere)
    private readonly piedMereRepository: Repository<PiedMere>,

    private varieteService: VarieteService,
    private environementService: EnvironmentsService,
  ) { }

  async findAll(userId: number): Promise<Lot[]> {
    return await this.lotRepository.find({ where: { userId: userId } });
  }

  async findOne(id: number, userId: number): Promise<any> {
    // Sécurisation: récupérer le lot AVEC la vérification userId
    const lot = await this.lotRepository.findOne({ where: { id: id, userId: userId }});

    if (!lot) {
      throw new HttpException("Lot non trouvé ou accès refusé", HttpStatus.NOT_FOUND);
    }

    const envlot = await this.lotRepository.query(`SELECT * FROM environnements_lots WHERE lotId = ? And date_sortie IS NULL`, [id]);

    return {...lot, environnements: envlot[0]?.environnementId};
  }

  async getActions(idLot: number, userId: number): Promise<LotAction[]> {
    // Sécurisation: vérifier l'ownership directement dans la requête
    const lot = await this.lotRepository.findOne({ where: { id: idLot, userId: userId }});

    if (!lot) {
      throw new HttpException("Lot non trouvé ou accès refusé", HttpStatus.NOT_FOUND);
    }

    return await this.lotActionRepository.query(`SELECT * FROM lot_action WHERE lotId = ?`, [idLot]);
  }

  async addAction(idLot: number, action: CreateLotActionDto, userId: number): Promise<LotAction> {
    const lot = await this.lotRepository.findOne({ where: { id: idLot , userId: userId} });

    if (!lot || lot.userId !== userId) {
      throw new HttpException("Vous n'avez pas accès à cette ressource", HttpStatus.FORBIDDEN);
    }

    const actionToSave = new LotAction();
    actionToSave.type = action.type;
    actionToSave.description = action.description;
    actionToSave.quantity = action.quantity;
    actionToSave.unit = action.unit;
    actionToSave.lotId = idLot; // ⚠️ on passe bien l'objet Lot ici
    actionToSave.date = new Date(action.date);

    // 🔁 Ajouter les nutriments
    if (action.engraisUtilises?.length) {
      actionToSave.engraisUtilises = action.engraisUtilises.map((nutriment) => {
        const nutrimentAction = new NutrimentAction();
        nutrimentAction.nutriment = nutriment.nutrimentId; // Relation minimale
        nutrimentAction.mlParLitre = nutriment.dosage;
        // ❌ PAS de nutrimentAction.action = actionToSave (cercle)
        return nutrimentAction;
      });
    }

    // 🔁 Changer la stage + dateFin si maturation
    if(action.stage){
      actionToSave.stage = action.stage;

      if(action.stage == 'maturation'){

        await this.lotRepository.update(actionToSave.lotId, {
          etapeCulture: action.stage,
          dateFin: new Date(action.date),
          quantite: action.quantity, // Sauvegarder la quantité récoltée
          stock: action.quantity // Le stock initial = quantité récoltée
        });

        // Si c'est un lot de graines qui passe en maturation et qu'il a des clones test,
        // marquer le lot de clones test comme prêt pour évaluation
        if(lot.origine === 'graine' && lot.clonesTestCrees && lot.lotClonesTestId){
          await this.lotRepository.update(lot.lotClonesTestId, {
            enAttenteSelection: true
          });
        }

      }else{

        await this.lotRepository.update(actionToSave.lotId, {
          etapeCulture: action.stage
        });

      }

    }

    if(action.OldEnv != null && action.NewEnv != null){
      let etape = action.stage == 'croissance' || 'floraison' || 'semi' ? 'culture' : action.stage;

      console.log(etape)
      let environmentLot = new EnvironnementLot();
      environmentLot.lotId = actionToSave.lotId;
      environmentLot.environnementId = action.NewEnv;
      environmentLot.etape = etape;
      environmentLot.date_entree = new Date(action.date).toISOString().substring(0, 10);
      environmentLot.date_sortie = null;
      environmentLot.commentaire = null;
      await this.environementService.makeEnvironmentLot(environmentLot, userId);

      actionToSave.OldEnv = action.OldEnv;
      actionToSave.NewEnv = action.NewEnv;
    }

    const saved = await this.lotActionRepository.save(actionToSave);

    // 🔁 Recharge sans les cycles (et éventuellement avec relations si tu veux)
    return this.lotActionRepository.findOne({
      where: { id: saved.id },
      relations: ['engraisUtilises', 'engraisUtilises.nutriment'],
    });
  }

  async deleteAction(id: number, userid: number) {
    const action = await this.lotActionRepository.findOne({where: {id: id}, relations: ['lot']});
  
    if(action == null){
      throw new NotFoundException("Aucune action trouvée");
    }

    if(action.lot.userId != userid){
      throw new ForbiddenException("Vous n'avez pas la permission de supprimer cette action");
    }

    await this.lotActionRepository.delete({id: id});
    }


  async createLot(lot: CreateLotDto, userid:number) {
    // Si origine = clone_production, vérifier le pied mère
    if (lot.origine === 'clone_production') {
      if (!lot.piedMereId) {
        throw new HttpException('piedMereId est requis pour créer un lot de clones de production', HttpStatus.BAD_REQUEST);
      }

      const piedMere = await this.piedMereRepository.findOne({
        where: { id: lot.piedMereId },
      });

      if (!piedMere) {
        throw new NotFoundException(`Pied mère avec l'ID ${lot.piedMereId} introuvable`);
      }

      if (piedMere.userId !== userid) {
        throw new ForbiddenException('Accès non autorisé à ce pied mère');
      }

      if (piedMere.statut !== 'actif') {
        throw new HttpException('Le pied mère doit être actif pour créer des lots', HttpStatus.BAD_REQUEST);
      }
    }

    let newLot = new Lot();
    newLot.userId = userid
    newLot.nom = lot.name;
    newLot.description = lot.description;
    newLot.dateDebut = new Date(String(lot.dateDebut));
    newLot.variete = await this.varieteService.getVarieteById(lot.varietyId);
    newLot.planteQuantite = lot.PlanteQuantite;
    newLot.substrat = lot.substrat || null;
    newLot.origine = lot.origine || 'graine';
    newLot.piedMereId = lot.piedMereId || null;
    newLot.generation = lot.origine === 'clone_production' ? 1 : 0;

    // Définir l'étape de culture en fonction de l'origine
    if (lot.origine === 'graine') {
      newLot.etapeCulture = 'semi';
    } else if (lot.origine === 'clone_production' || lot.origine === 'clone_test') {
      newLot.etapeCulture = 'Croissance';
    } else {
      newLot.etapeCulture = 'Croissance'; // Par défaut
    }

    const lots = await this.lotRepository.save(newLot);

    let newEnvLot = new EnvironnementLot();
    newEnvLot.lotId = lots.id;
    newEnvLot.environnementId = lot.environmentId;
    newEnvLot.etape = 'culture';
    newEnvLot.date_entree = new Date().toISOString().substring(0,10);
    newEnvLot.date_sortie = null;
    newEnvLot.commentaire = null;

    await this.environementService.makeEnvironmentLot(newEnvLot, userid)

    // Créer une action de stage initiale pour tracker l'étape de départ
    const initialStageAction = new LotAction();
    initialStageAction.lotId = lots.id;
    initialStageAction.type = 'stage';
    initialStageAction.date = new Date(String(lot.dateDebut));

    if (lot.origine === 'graine') {
      initialStageAction.stage = 'semi';
      initialStageAction.description = 'Début de la phase de semi';
    } else if (lot.origine === 'clone_production' || lot.origine === 'clone_test') {
      initialStageAction.stage = 'croissance';
      initialStageAction.description = 'Début de la phase de croissance';
    } else {
      initialStageAction.stage = 'croissance';
      initialStageAction.description = 'Début de la phase de croissance';
    }

    await this.lotActionRepository.save(initialStageAction);

    // Update mother plant stats if applicable
    if (lot.origine === 'clone_production' && lot.piedMereId) {
      const piedMere = await this.piedMereRepository.findOne({
        where: { id: lot.piedMereId },
      });
      await this.piedMereRepository.update(lot.piedMereId, {
        nombreClonesPrelevés: piedMere.nombreClonesPrelevés + lot.PlanteQuantite,
        dernierPrelevement: new Date(),
      });
    }

    return lots;

  }

  async findActif(userId: number): Promise<Lot[]> {
    return await this.lotRepository.find({ where: { userId: userId, dateFin: IsNull() } });
  }

  async findOld(userId: number): Promise<Lot[]> {
    return await this.lotRepository.find({ where: { userId: userId,  dateFin: Not(IsNull()) } });
  }

  async getStage(id: number, userId: number, date: Date): Promise<any> {
    const lot = await this.lotRepository.findOne({ where: { id: id, userId: userId } });

    if (!lot) {
      throw new HttpException("Lot non trouvé", HttpStatus.NOT_FOUND);
    }

    if(lot.userId != userId) {
      throw new HttpException("Vous n'avez pas accès à cette ressource", HttpStatus.FORBIDDEN);
    }

    const result = await this.lotActionRepository.query(`SELECT stage, DATEDIFF(?, date) AS jours_ecoules FROM lot_action WHERE type = 'stage' AND date <= ? AND lotId = ? ORDER BY date DESC LIMIT 1`, [date, date, id]);

    // Si aucune action de stage trouvée, utiliser les infos du lot lui-même
    if (result.length === 0) {
      // Calculer les jours depuis la date de début du lot
      const joursEcoules = await this.lotRepository.query(
        `SELECT DATEDIFF(?, dateDebut) AS jours_ecoules FROM lots WHERE id = ?`,
        [date, id]
      );

      return {
        stage: lot.etapeCulture.toLowerCase(), // Normaliser en minuscules
        jours_ecoules: joursEcoules[0].jours_ecoules
      };
    }

    // Retourner le premier élément du tableau si des actions existent
    return result[0];
  }

  async makeShareLot(shareLot: CreateShareLots, userId: number) {
    shareLot.lotId = shareLot.lotId;
    
    const lot = await this.lotRepository.findOne({ where: { id: shareLot.lotId, userId: userId } });

    if (!lot) {
      throw new HttpException("Lot non trouvé", HttpStatus.NOT_FOUND);
    }

    if(lot.userId != userId) {
      throw new HttpException("Vous n'avez pas accès à cette ressource", HttpStatus.FORBIDDEN);
    }

    const exist = await this.shareLotsRepository.findOne({ where: { lotId: shareLot.lotId } });

    if(exist){
      return {uuid : exist.id};
    }

    const newShare = await this.shareLotsRepository.save(shareLot);

    return {uuid : newShare.id};
  }

  async getStatistics(userId: number): Promise<any> {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    // 1. Plants plantés total (tous temps)
    const plantsPlantesTotal = await this.lotRepository.query(`
      SELECT COALESCE(SUM(planteQuantite), 0) as total
      FROM lots
      WHERE userId = ?
    `, [userId]);

    // Plants plantés ce mois (pour le calcul du pourcentage)
    const plantsPlantesThisMonth = await this.lotRepository.query(`
      SELECT COALESCE(SUM(planteQuantite), 0) as total
      FROM lots
      WHERE userId = ?
        AND MONTH(dateDebut) = ?
        AND YEAR(dateDebut) = ?
    `, [userId, currentMonth, currentYear]);

    // 2. Plants récoltés total (tous temps)
    const plantsRecoltesTotal = await this.lotRepository.query(`
      SELECT COALESCE(SUM(l.planteQuantite), 0) as total
      FROM lots l
      INNER JOIN lot_action la ON la.lotId = l.id
      WHERE l.userId = ?
        AND la.type = 'stage'
        AND la.stage = 'sechage'
    `, [userId]);

    // Plants récoltés ce mois (passés en stage séchage)
    const plantsRecoltesThisMonth = await this.lotRepository.query(`
      SELECT COALESCE(SUM(l.planteQuantite), 0) as total
      FROM lots l
      INNER JOIN lot_action la ON la.lotId = l.id
      WHERE l.userId = ?
        AND la.type = 'stage'
        AND la.stage = 'sechage'
        AND MONTH(la.date) = ?
        AND YEAR(la.date) = ?
    `, [userId, currentMonth, currentYear]);


    // 3. Quantité récoltée sur l'année
    const recoltesAnnee = await this.lotRepository.query(`
      SELECT COALESCE(SUM(l.quantite), 0) as total
      FROM lot_action la
      INNER JOIN lots l ON l.id = la.lotId
      WHERE l.userId = ?
        AND la.type = 'stage'
        AND la.stage = 'sechage'
        AND YEAR(la.date) = ?
        AND l.quantite IS NOT NULL
    `, [userId, currentYear]);

    // 4. Nombre de lots actifs
    const lotsActifs = await this.lotRepository.query(`
      SELECT COUNT(*) as total
      FROM lots
      WHERE userId = ?
        AND dateFin IS NULL
    `, [userId]);


    const plantsPlantesTotalAllTime = plantsPlantesTotal[0].total;
    const plantsPlantesActuel = plantsPlantesThisMonth[0].total;
    const plantsRecoltesTotalAllTime = plantsRecoltesTotal[0].total;
    const plantsRecoltesActuel = plantsRecoltesThisMonth[0].total;

    return {
      plantsPlantes: {
        total: plantsPlantesTotalAllTime,
        mois: plantsPlantesActuel
      },
      plantsRecoltes: {
        total: plantsRecoltesTotalAllTime,
        mois: plantsRecoltesActuel
      },
      recoltesAnnee: recoltesAnnee[0].total,
      lotsActifs: lotsActifs[0].total
    };
  }

  async getRecentActivities(userId: number): Promise<any[]> {
    const activities = await this.lotRepository.query(`
      (
        -- Création de lots
        SELECT
          'lot_created' as activity_type,
          l.createdAt as date,
          CONCAT('Nouveau lot créé - ', l.nom, ' (', v.nom, ') - ', l.planteQuantite, ' plants') as description,
          l.id as lot_id,
          l.nom as lot_name,
          v.nom as variete_name,
          NULL as environment_id,
          NULL as environment_name,
          l.planteQuantite as quantity,
          NULL as unit
        FROM lots l
        INNER JOIN varietes v ON l.varieteId = v.id
        WHERE l.userId = ?
      )
      UNION ALL
      (
        -- Actions de lots (arrosage, taille, engraissage, changement de stage)
        SELECT
          la.type as activity_type,
          la.date as date,
          CASE
            WHEN la.type = 'arrosage' THEN CONCAT('Arrosage effectué - ', l.nom, ' - ', COALESCE(la.quantity, 0), ' ', COALESCE(la.unit, 'L'))
            WHEN la.type = 'taille' THEN CONCAT('Taille effectuée - ', l.nom)
            WHEN la.type = 'engrais' THEN CONCAT('Engraissage - ', l.nom, ' - ', COALESCE(la.quantity, 0), ' ', COALESCE(la.unit, 'g'))
            WHEN la.type = 'stage' AND la.stage = 'sechage' THEN CONCAT('Récolte terminée - ', l.nom, ' - ', l.planteQuantite, ' plants récoltés')
            WHEN la.type = 'stage' THEN CONCAT('Changement de stage - ', l.nom, ' → ', la.stage)
            ELSE CONCAT(la.type, ' - ', l.nom)
          END as description,
          l.id as lot_id,
          l.nom as lot_name,
          v.nom as variete_name,
          la.NewEnv as environment_id,
          e.nom as environment_name,
          la.quantity,
          la.unit
        FROM lot_action la
        INNER JOIN lots l ON la.lotId = l.id
        INNER JOIN varietes v ON l.varieteId = v.id
        LEFT JOIN environnements e ON la.NewEnv = e.id
        WHERE l.userId = ?
      )
      UNION ALL
      (
        -- Création d'environnements (en utilisant la première utilisation comme proxy)
        SELECT DISTINCT
          'environment_created' as activity_type,
          (SELECT MIN(el2.date_entree) FROM environnements_lots el2 WHERE el2.environnementId = e.id) as date,
          CONCAT('Nouvel environnement - ', e.nom, ' (', e.type, ', ', e.culture_type, ')') as description,
          NULL as lot_id,
          NULL as lot_name,
          NULL as variete_name,
          e.id as environment_id,
          e.nom as environment_name,
          NULL as quantity,
          NULL as unit
        FROM environnements e
        WHERE e.userId = ?
          AND EXISTS (SELECT 1 FROM environnements_lots el WHERE el.environnementId = e.id)
      )
      ORDER BY date DESC
      LIMIT 5
    `, [userId, userId, userId]);

    return activities.map(activity => ({
      type: activity.activity_type,
      date: activity.date,
      description: activity.description,
      lot: activity.lot_id ? {
        id: activity.lot_id,
        name: activity.lot_name,
        variete: activity.variete_name
      } : null,
      environment: activity.environment_id ? {
        id: activity.environment_id,
        name: activity.environment_name
      } : null,
      quantity: activity.quantity,
      unit: activity.unit
    }));
  }

  async getCultureEvolution(userId: number): Promise<any> {
    const stageEvolution = await this.lotRepository.query(`
      SELECT
        etapeCulture as stage,
        COUNT(*) as lots_count
      FROM lots
      WHERE userId = ?
      GROUP BY etapeCulture
      ORDER BY
        CASE etapeCulture
          WHEN 'semi' THEN 1
          WHEN 'croissance' THEN 2
          WHEN 'floraison' THEN 3
          WHEN 'maturation' THEN 4
          WHEN 'sechage' THEN 5
          ELSE 6
        END
    `, [userId]);

    const stageLabels = {
      'semi': 'Semi',
      'croissance': 'Croissance',
      'floraison': 'Floraison',
      'maturation': 'Maturation',
      'sechage': 'Séchage'
    };

    const totalLots = stageEvolution.reduce((sum, stage) => sum + stage.lots_count, 0);

    const stages = stageEvolution.map(stage => ({
      stage: stage.stage,
      label: stageLabels[stage.stage] || stage.stage,
      lots_count: stage.lots_count,
      percentage: totalLots > 0 ? Math.round((stage.lots_count / totalLots) * 100) : 0
    }));

    return {
      stages,
      total_lots: totalLots
    };
  }

  async updateLotQuantity(lotId: number, quantity: number, userId: number): Promise<any> {
    const lot = await this.lotRepository.findOne({ where: { id: lotId, userId: userId } });

    if (!lot) {
      throw new HttpException("Lot non trouvé", HttpStatus.NOT_FOUND);
    }

    if (lot.userId !== userId) {
      throw new HttpException("Vous n'avez pas accès à cette ressource", HttpStatus.FORBIDDEN);
    }

    await this.lotRepository.update(lotId, { quantite: quantity });

    return { message: "Quantité mise à jour avec succès", quantite: quantity };
  }



  async getMaturationLots(userId: number) {
    const lots = await this.lotRepository.query(`
      SELECT
        l.id,
        l.nom,
        l.quantite,
        l.stock,
        l.etapeCulture,
        l.planteQuantite,
        v.nom as variete_nom,
        v.breeder,
        v.type,
        v.tauxTHC,
        v.tauxCBD,
        COUNT(DISTINCT el.environnementId) as environnements
      FROM lots l
      LEFT JOIN varietes v ON l.varieteId = v.id
      LEFT JOIN environnements_lots el ON l.id = el.lotId
      WHERE l.etapeCulture = 'Maturation' AND l.userId = ?
      GROUP BY l.id, l.nom, l.quantite, l.stock, l.etapeCulture, l.planteQuantite, v.nom, v.breeder, v.type, v.tauxTHC, v.tauxCBD
      ORDER BY l.updatedAt DESC
    `, [userId]);

    return lots.map(lot => ({
      id: lot.id,
      nom: lot.nom,
      quantite: parseFloat(lot.quantite || 0),
      stock: parseFloat(lot.stock || 0),
      etapeCulture: lot.etapeCulture,
      planteQuantite: lot.planteQuantite,
      variete: {
        nom: lot.variete_nom,
        breeder: lot.breeder,
        type: lot.type,
        tauxTHC: parseFloat(lot.tauxTHC || 0),
        tauxCBD: parseFloat(lot.tauxCBD || 0)
      },
      environnements: parseInt(lot.environnements || 0)
    }));
  }

  async getAverageConditionsByStage(lotId: number, userId: number): Promise<any[]> {
    // Vérifier que le lot appartient à l'utilisateur
    const lot = await this.lotRepository.findOne({ where: { id: lotId, userId: userId } });

    if (!lot) {
      throw new NotFoundException("Lot non trouvé ou accès refusé");
    }

    // Récupérer toutes les actions de changement de stade
    const actions = await this.lotActionRepository.find({
      where: { lotId: lotId, type: 'stage' },
      order: { date: 'ASC' }
    });

    const result = await Promise.all(actions.map(async (action, index) => {
      const dateOfStage = new Date(action.date);
      const endOfStage = index + 1 >= actions.length
        ? new Date()
        : new Date(actions[index + 1].date);

      // Trouver l'environnement du lot à cette date
      let env = await this.environnementLotRepository.query(
        `SELECT * FROM environnements_lots e WHERE e.lotId = ? AND e.date_entree = ? LIMIT 1`,
        [lotId, dateOfStage.toISOString().substring(0, 10)]
      );

      if (env.length === 0) {
        env = await this.environnementLotRepository.query(
          `SELECT * FROM environnements_lots e WHERE e.lotId = ? Order by e.date_entree DESC LIMIT 1`,
          [lotId]
        );
      }

      if (env.length === 0) {
        return null;
      }

      // Calculer les moyennes des conditions pour ce stade
      const envConditions = await this.conditionEnvironnementaleRepository.query(
        `SELECT AVG(temperature) as temperature, AVG(humidite) as humidite
        FROM conditions_environnementales c
        WHERE c.environnementId = ?
        AND DATE(c.date_heure) >= ?
        AND DATE(c.date_heure) <= ?
        ORDER BY c.date_heure ASC`,
        [env[0].environnementId, dateOfStage.toISOString().substring(0, 10), endOfStage.toISOString().substring(0, 10)]
      );

      if (envConditions.length > 0 && envConditions[0].temperature !== null) {
        return {
          stage: action.stage,
          temperature: parseFloat(envConditions[0].temperature),
          humidite: parseFloat(envConditions[0].humidite)
        };
      }

      return null;
    }));

    // Filtrer les résultats null et aplatir
    return result.filter(r => r !== null);
  }

  async getStageStartDates(lotId: number, userId: number): Promise<{ stage: string; date: Date }[]> {
    // Vérifier que le lot appartient à l'utilisateur
    const lot = await this.lotRepository.findOne({ where: { id: lotId, userId: userId } });

    if (!lot) {
      throw new NotFoundException("Lot non trouvé ou accès refusé");
    }

    // Récupérer toutes les actions "stage" du lot
    const actions = await this.lotActionRepository.find({
      where: { lotId: lotId, type: 'stage' },
      order: { date: 'ASC' }
    });

    // Retourner uniquement stage + date
    return actions.map(action => ({
      stage: action.stage,
      date: new Date(action.date)
    }));
  }

  async getEnvironmentHistory(lotId: number, userId: number): Promise<any[]> {
    // Vérifier que le lot appartient à l'utilisateur
    const lot = await this.lotRepository.findOne({ where: { id: lotId, userId: userId } });
    if (!lot) {
      throw new NotFoundException("Lot non trouvé ou accès refusé");
    }

    // Récupérer tous les environnements associés au lot, triés par date d'entrée
    const environnementLots = await this.environnementLotRepository.find({
      where: { lotId: lotId },
      relations: ['environnement'],
      order: { date_entree: 'ASC' }
    });

    // Récupérer toutes les actions de changement de stade pour mapper les stades aux périodes
    const stageActions = await this.lotActionRepository.find({
      where: { lotId: lotId, type: 'stage' },
      order: { date: 'ASC' }
    });

    const result = [];

    for (const envLot of environnementLots) {
      const dateDebut = new Date(envLot.date_entree);
      const dateFin = envLot.date_sortie ? new Date(envLot.date_sortie) : null;

      // Trouver tous les changements de stade qui se sont produits pendant cette période d'environnement
      const stagesInThisEnv = stageActions.filter(action => {
        const actionDate = new Date(action.date);
        const isAfterStart = actionDate >= dateDebut;
        const isBeforeEnd = dateFin ? actionDate < dateFin : true;
        return isAfterStart && isBeforeEnd;
      });

      // Si aucun stade trouvé pendant cette période, utiliser l'étape de l'environnement
      if (stagesInThisEnv.length === 0) {
        const dureeJours = dateFin
          ? Math.floor((dateFin.getTime() - dateDebut.getTime()) / (1000 * 60 * 60 * 24))
          : Math.floor((new Date().getTime() - dateDebut.getTime()) / (1000 * 60 * 60 * 24));

        result.push({
          environment: {
            id: envLot.environnement.id,
            nom: envLot.environnement.nom,
            type: envLot.environnement.type,
            localisation: envLot.environnement.localisation,
            surface_m2: envLot.environnement.surface_m2,
            culture_type: envLot.environnement.culture_type
          },
          stage: envLot.etape,
          dateDebut: dateDebut,
          dateFin: dateFin,
          dureeJours: dureeJours
        });
      } else {
        // Créer une entrée pour chaque stade dans cet environnement
        for (let i = 0; i < stagesInThisEnv.length; i++) {
          const stageAction = stagesInThisEnv[i];
          const stageDebut = new Date(stageAction.date);

          // La fin du stade est soit le début du prochain stade, soit la sortie de l'environnement
          let stageFin: Date | null;
          if (i + 1 < stagesInThisEnv.length) {
            stageFin = new Date(stagesInThisEnv[i + 1].date);
          } else {
            stageFin = dateFin;
          }

          const dureeJours = stageFin
            ? Math.floor((stageFin.getTime() - stageDebut.getTime()) / (1000 * 60 * 60 * 24))
            : Math.floor((new Date().getTime() - stageDebut.getTime()) / (1000 * 60 * 60 * 24));

          result.push({
            environment: {
              id: envLot.environnement.id,
              nom: envLot.environnement.nom,
              type: envLot.environnement.type,
              localisation: envLot.environnement.localisation,
              surface_m2: envLot.environnement.surface_m2,
              culture_type: envLot.environnement.culture_type
            },
            stage: stageAction.stage,
            dateDebut: stageDebut,
            dateFin: stageFin,
            dureeJours: dureeJours
          });
        }
      }
    }

    return result;
  }

  async prelevementClonesTest(dto: PrelevementClonesTestDto, userId: number): Promise<Lot> {
    // Verify ownership of parent seed lot
    const lotGraines = await this.lotRepository.findOne({
      where: { id: dto.lotGrainesId },
      relations: ['variete'],
    });

    if (!lotGraines) {
      throw new NotFoundException(`Lot de graines avec l'ID ${dto.lotGrainesId} introuvable`);
    }

    if (lotGraines.userId !== userId) {
      throw new ForbiddenException('Accès non autorisé à ce lot');
    }

    if (lotGraines.origine !== 'graine') {
      throw new HttpException('Le prélèvement de clones test ne peut se faire que sur des lots de graines', HttpStatus.BAD_REQUEST);
    }

    if (lotGraines.clonesTestCrees) {
      throw new HttpException('Un lot de clones test a déjà été créé pour ce lot de graines', HttpStatus.BAD_REQUEST);
    }

    // Create clone test lot
    const newLot = new Lot();
    newLot.userId = userId;
    newLot.nom = dto.nom;
    newLot.description = dto.description || `Clones test issus de ${lotGraines.nom}`;
    newLot.dateDebut = new Date(dto.dateDebut);
    newLot.variete = lotGraines.variete;
    newLot.planteQuantite = dto.nombreClones;
    newLot.substrat = dto.substrat || null;
    newLot.origine = 'clone_test';
    newLot.lotParentGrainesId = dto.lotGrainesId;
    newLot.enAttenteSelection = true;
    newLot.generation = 1;
    newLot.etapeCulture = 'Croissance'; // Définir explicitement le stage à Croissance

    const savedLot = await this.lotRepository.save(newLot);

    // Create environment link
    const newEnvLot = new EnvironnementLot();
    newEnvLot.lotId = savedLot.id;
    newEnvLot.environnementId = dto.environmentId;
    newEnvLot.etape = 'culture';
    newEnvLot.date_entree = new Date(dto.dateDebut).toISOString().substring(0, 10);
    newEnvLot.date_sortie = null;
    newEnvLot.commentaire = `Prélèvement de ${dto.nombreClones} clones test depuis ${lotGraines.nom}`;

    await this.environementService.makeEnvironmentLot(newEnvLot, userId);

    // Créer une action de stage pour marquer le début de la croissance
    const stageAction = new LotAction();
    stageAction.lotId = savedLot.id;
    stageAction.type = 'stage';
    stageAction.description = 'Début de la phase de croissance';
    stageAction.date = new Date(dto.dateDebut);
    stageAction.stage = 'croissance';
    await this.lotActionRepository.save(stageAction);

    // Créer une action pour historique du prélèvement
    const prelevementAction = new LotAction();
    prelevementAction.lotId = savedLot.id;
    prelevementAction.type = 'prelevement_clones';
    prelevementAction.description = `Prélèvement de ${dto.nombreClones} clones test depuis le lot ${lotGraines.nom}`;
    prelevementAction.date = new Date(dto.dateDebut);
    await this.lotActionRepository.save(prelevementAction);

    // Update parent lot
    await this.lotRepository.update(dto.lotGrainesId, {
      clonesTestCrees: true,
      lotClonesTestId: savedLot.id,
    });

    return savedLot;
  }

  async createFromMother(dto: CreateLotFromMotherDto, userId: number): Promise<Lot> {
    // Verify mother plant ownership
    const piedMere = await this.piedMereRepository.findOne({
      where: { id: dto.piedMereId },
      relations: ['variete'],
    });

    if (!piedMere) {
      throw new NotFoundException(`Pied mère avec l'ID ${dto.piedMereId} introuvable`);
    }

    if (piedMere.userId !== userId) {
      throw new ForbiddenException('Accès non autorisé à ce pied mère');
    }

    if (piedMere.statut !== 'actif') {
      throw new HttpException('Le pied mère doit être actif pour prélever des clones', HttpStatus.BAD_REQUEST);
    }

    // Create production clone lot
    const newLot = new Lot();
    newLot.userId = userId;
    newLot.nom = dto.nom;
    newLot.description = dto.description || `Clones de production issus du pied mère ${piedMere.nom} (${piedMere.code})`;
    newLot.dateDebut = new Date(dto.dateDebut);
    newLot.variete = piedMere.variete;
    newLot.planteQuantite = dto.nombreClones;
    newLot.substrat = dto.substrat || null;
    newLot.origine = 'clone_production';
    newLot.piedMereId = dto.piedMereId;
    newLot.generation = piedMere.generation + 1;
    newLot.etapeCulture = 'Croissance'; // Définir explicitement le stage à Croissance

    const savedLot = await this.lotRepository.save(newLot);

    // Create environment link
    const newEnvLot = new EnvironnementLot();
    newEnvLot.lotId = savedLot.id;
    newEnvLot.environnementId = dto.environmentId;
    newEnvLot.etape = 'culture';
    newEnvLot.date_entree = new Date(dto.dateDebut).toISOString().substring(0, 10);
    newEnvLot.date_sortie = null;
    newEnvLot.commentaire = `Prélèvement de ${dto.nombreClones} clones de production depuis le pied mère ${piedMere.code}`;

    await this.environementService.makeEnvironmentLot(newEnvLot, userId);

    // Créer une action de stage pour marquer le début de la croissance
    const stageAction = new LotAction();
    stageAction.lotId = savedLot.id;
    stageAction.type = 'stage';
    stageAction.description = 'Début de la phase de croissance';
    stageAction.date = new Date(dto.dateDebut);
    stageAction.stage = 'croissance';
    await this.lotActionRepository.save(stageAction);

    // Créer une action pour historique du prélèvement
    const prelevementAction = new LotAction();
    prelevementAction.lotId = savedLot.id;
    prelevementAction.type = 'prelevement_clones';
    prelevementAction.description = `Prélèvement de ${dto.nombreClones} clones de production depuis le pied mère ${piedMere.nom} (${piedMere.code})`;
    prelevementAction.date = new Date(dto.dateDebut);
    await this.lotActionRepository.save(prelevementAction);

    // Update mother plant stats
    await this.piedMereRepository.update(dto.piedMereId, {
      nombreClonesPrelevés: piedMere.nombreClonesPrelevés + dto.nombreClones,
      dernierPrelevement: new Date(),
    });

    return savedLot;
  }

}
