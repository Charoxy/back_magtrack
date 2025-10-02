import { ForbiddenException, HttpException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { Brackets, IsNull, LessThan, LessThanOrEqual, MoreThanOrEqual, Repository } from "typeorm";
import { Environnement } from "../entities/entitie.environements";
import { EnvironnementLot } from "../entities/entitie.environement-lot";
import { ConditionEnvironnementale } from "../entities/entitie.condition-environnementale";
import { InjectRepository } from "@nestjs/typeorm";
import e from "express";
import { EnvMake } from "../dto/envmake";
import { CreateConditionEnvironnementaleDto } from "../dto/conditionenvMake";
import { User } from "../entities/entitie.user";
import moment from "moment-timezone";
import { Lot } from "../entities/entitie.lots";

@Injectable()
export class EnvironmentsService {

  constructor(
    @InjectRepository(Environnement)
    private readonly environmentsRepository: Repository<Environnement>,

    @InjectRepository(EnvironnementLot)
    private readonly environnementsLotsRepository: Repository<EnvironnementLot>,

    @InjectRepository(ConditionEnvironnementale)
    private readonly conditionEnvironnementalesRepository: Repository<ConditionEnvironnementale>,

    @InjectRepository(Lot)
    private readonly lotRepository: Repository<Lot>,
  ) {
  }

  async getAllEnvironments(userId: number): Promise<Environnement[]> {
    return this.environmentsRepository.find({ where: { userId: userId } });
  }

  async getAllEnvironmentsWithLots(userid: number): Promise<Environnement[]> {
    return this.environmentsRepository.find(
      {
        where: { userId:  userid },
        relations: ['lots_associes','lots_associes.lot']
      }
    );
  }

  async isTodayConditionsIsSubmitted(id: number, userId: number): Promise<boolean> {
      // Vérifier l'ownership de l'environnement
      const environment = await this.environmentsRepository.findOne({ where: { id: id, userId: userId } });
      if (!environment) {
        throw new NotFoundException("Environnement non trouvé ou accès refusé");
      }

      const condition = await this.conditionEnvironnementalesRepository.findOne({where: {environnementId: id}, order: {date_heure: 'DESC'}});

      if(condition == null || condition.date_heure.toISOString().substring(0,10) != new Date().toISOString().substring(0,10)){
          return false;
      }
      else return condition.date_heure.toISOString().substring(0,10) == new Date().toISOString().substring(0,10);
  }

  async getEnvironmentLots(environmentId: number, userId: number): Promise<EnvironnementLot[]> {
    // Vérifier l'ownership de l'environnement
    const environment = await this.environmentsRepository.findOne({ where: { id: environmentId, userId: userId } });
    if (!environment) {
      throw new NotFoundException("Environnement non trouvé ou accès refusé");
    }

    return this.environnementsLotsRepository.find({where: {environnementId: environmentId}});
  }

  async makeEnvironment(env: EnvMake, userId: number){


      const environment = new Environnement();

      environment.nom = env.nom;
      environment.type = env.type;
      environment.culture_type = env.culture_type;
      environment.localisation = env.localisation;
      environment.surface_m2 = env.surface_m2;
      environment.capacite_max_plants = env.capacite_max_plants;
      environment.temp_cible_min = env.temp_cible_min;
      environment.temp_cible_max = env.temp_cible_max;
      environment.humidite_cible_min = env.humidite_cible_min;
      environment.humidite_cible_max = env.humidite_cible_max;
      environment.co2_cible_ppm = env.co2_cible_ppm;
      environment.lumiere_watt = env.lumiere_watt;
      environment.photoperiode_jour = env.photoperiode_jour;
      environment.photoperiode_nuit = env.photoperiode_nuit;
      environment.alertes_activees = env.alertes_activees;
      environment.statut = env.statut;
      environment.commentaires = env.commentaires;
      environment.userId = userId;
      environment.nombre_ventilateurs = env.nombre_ventilateurs;

      return  await this.environmentsRepository.save(environment);
  }

  async getEnvironmentById(id: number): Promise<Environnement> {
    return this.environmentsRepository.findOne({where: {id: id}});
  }

  async makeEnvironmentLot(lot: EnvironnementLot, userId: number){
    // Vérifier l'ownership de l'environnement
    const environment = await this.environmentsRepository.findOne({ where: { id: lot.environnementId, userId: userId } });
    if (!environment) {
      throw new NotFoundException("Environnement non trouvé ou accès refusé");
    }

    // Vérifier l'ownership du lot
    const lotEntity = await this.lotRepository.findOne({ where: { id: lot.lotId, userId: userId } });
    if (!lotEntity) {
      throw new NotFoundException("Lot non trouvé ou accès refusé");
    }

    console.log(lot.lot)

    //update date_sortie
    await this.environnementsLotsRepository.query(`UPDATE environnements_lots SET date_sortie = ? WHERE lotId = ? AND date_sortie IS NULL`, [new Date(lot.date_entree), lot.lot]);

    return  await this.environnementsLotsRepository.save(lot);
  }

  async getEnvironmentConditions(id: number): Promise<ConditionEnvironnementale[]> {
    return this.conditionEnvironnementalesRepository.find({where: {environnementId: id}});
  }

  async getLastEnvironmentConditions(id: number): Promise<ConditionEnvironnementale> {
    const env = await this.conditionEnvironnementalesRepository.find({where: {environnementId: id}, order: {date_heure: 'DESC'}});
    return env[0];
  }

  async makeEnvironmentCondition(condition: CreateConditionEnvironnementaleDto, userId: number){

    const conditionEnv = new ConditionEnvironnementale();
    const actualEnv = await this.getActualEnvironementLot(condition.LotId, condition.date_heure,userId);


    conditionEnv.environnementId = actualEnv[0].environnementId;
    conditionEnv.date_heure = condition.date_heure;
    conditionEnv.temperature = condition.temperature;
    conditionEnv.humidite = condition.humidite;
    conditionEnv.co2 = condition.co2;
    conditionEnv.lumiere = condition.lumiere;
    conditionEnv.source = condition.source;
    conditionEnv.commentaire = condition.commentaire;

    return  await this.conditionEnvironnementalesRepository.save(conditionEnv);

  }

  async getConditionForLotAtDate(lotId: number, date: Date, userId: number) {

    const envLot = await this.getActualEnvironementLot(lotId, date, userId);

    if (!envLot) {
      throw new ForbiddenException("Ce lot ne vous appartient pas ou n'existe pas à cette date.");
    }

    if(envLot[0] == null){
      throw new NotFoundException("Aucune condition pour cette date")
    }

    return await this.getConditionByDate(date, envLot[0].environnementId);

  }

  async getEnvironementsByDate(date: Date, lotId: number): Promise<[{environnementId: number}]> {
    return this.environnementsLotsRepository.query(`
        SELECT e.environnementId from environnements_lots e
            where lotId = ?
                and date_entree <= ?
                and (date_sortie IS NULL OR date_sortie >= ? AND date_sortie != ?)
    `, [lotId, date, date, date]);
  }

  async getActualEnvironementLot(lotId: number, date: Date, userId: number): Promise<[ { environnementId: number } ]> {

    return await this.environnementsLotsRepository.query(`
        SELECT e.environnementId from environnements_lots e
            INNER JOIN lots l on l.id = e.lotId
            where lotId = ?
                and date_entree <= ?
                and date_sortie IS NULL
                and l.userId = ?
    `, [lotId, date, userId]);
  }

  async getConditionByDate(date: Date, environnementId: number): Promise<[{environnementId: number}]> {
    return await this.environnementsLotsRepository.query(`
      Select * from conditions_environnementales c
      where c.environnementId = ?
      AND c.date_heure <= ?
      order by c.date_heure desc limit 1;`, [environnementId, date]);
  }

  // Nouvelles méthodes pour les statistiques d'environnement

  async getEnvironmentDetails(id: number, userId: number): Promise<any> {
    const environment = await this.environmentsRepository.findOne({
      where: { id: id, userId: userId }
    });

    if (!environment) {
      throw new NotFoundException("Environnement non trouvé");
    }

    return {
      id: environment.id,
      nom: environment.nom,
      type: environment.type,
      culture_type: environment.culture_type,
      description: environment.commentaires,
      created_at: new Date() // TODO: Ajouter createdAt à l'entité si nécessaire
    };
  }

  async getEnvironmentStatistics(id: number, userId: number): Promise<any> {
    // Vérifier que l'utilisateur a accès à cet environnement
    const environment = await this.environmentsRepository.findOne({
      where: { id: id, userId: userId }
    });

    if (!environment) {
      throw new NotFoundException("Environnement non trouvé");
    }

    // Calculs séparés pour éviter les doublons

    // 1. Lots actuellement dans l'environnement
    const currentLots = await this.lotRepository.query(`
      SELECT COUNT(DISTINCT l.id) as count
      FROM environnements_lots el
      INNER JOIN lots l ON l.id = el.lotId
      WHERE el.environnementId = ?
        AND l.userId = ?
        AND el.date_sortie IS NULL
        AND l.etapeCulture NOT IN ('sechage', 'maturation')
    `, [id, userId]);

    // 2. Total historique des lots ayant transité par l'environnement
    const historyLots = await this.lotRepository.query(`
      SELECT COUNT(DISTINCT lot_id) as count
      FROM (
        SELECT l.id as lot_id
        FROM environnements_lots el
        INNER JOIN lots l ON l.id = el.lotId
        WHERE el.environnementId = ? AND l.userId = ?
        UNION
        SELECT l.id as lot_id
        FROM lot_action la
        INNER JOIN lots l ON l.id = la.lotId
        WHERE (la.OldEnv = ? OR la.NewEnv = ?) AND l.userId = ?
      ) combined
    `, [id, userId, id, id, userId]);

    // 3. Lots terminés ayant transité par l'environnement
    const completedLots = await this.lotRepository.query(`
      SELECT COUNT(DISTINCT lot_id) as count
      FROM (
        SELECT l.id as lot_id
        FROM environnements_lots el
        INNER JOIN lots l ON l.id = el.lotId
        WHERE el.environnementId = ? AND l.userId = ?
          AND l.etapeCulture IN ('sechage', 'maturation')
        UNION
        SELECT l.id as lot_id
        FROM lot_action la
        INNER JOIN lots l ON l.id = la.lotId
        WHERE (la.OldEnv = ? OR la.NewEnv = ?) AND l.userId = ?
          AND l.etapeCulture IN ('sechage', 'maturation')
      ) combined
    `, [id, userId, id, id, userId]);

    // 4. Total des plants (basé sur tous les lots ayant transité)
    const totalPlants = await this.lotRepository.query(`
      SELECT COALESCE(SUM(unique_lots.planteQuantite), 0) as total
      FROM (
        SELECT DISTINCT l.id, l.planteQuantite
        FROM environnements_lots el
        INNER JOIN lots l ON l.id = el.lotId
        WHERE el.environnementId = ? AND l.userId = ?
        UNION
        SELECT DISTINCT l.id, l.planteQuantite
        FROM lot_action la
        INNER JOIN lots l ON l.id = la.lotId
        WHERE (la.OldEnv = ? OR la.NewEnv = ?) AND l.userId = ?
      ) unique_lots
    `, [id, userId, id, id, userId]);

    // 5. Rendement total (uniquement les lots terminés dans cet environnement)
    const totalYield = await this.lotRepository.query(`
      SELECT COALESCE(SUM(l.quantite), 0) as total
      FROM environnements_lots el
      INNER JOIN lots l ON l.id = el.lotId
      WHERE el.environnementId = ? AND l.userId = ?
        AND l.dateFin IS NOT NULL
        AND l.quantite IS NOT NULL
    `, [id, userId]);

    // 6. Rendement moyen par lot (lots terminés dans cet environnement)
    const avgYield = await this.lotRepository.query(`
      SELECT COALESCE(AVG(l.quantite), 0) as avg
      FROM environnements_lots el
      INNER JOIN lots l ON l.id = el.lotId
      WHERE el.environnementId = ? AND l.userId = ?
        AND l.dateFin IS NOT NULL
        AND l.quantite > 0
    `, [id, userId]);

    // 7. Durée moyenne et taux de succès
    const performanceStats = await this.lotRepository.query(`
      SELECT
        COALESCE(AVG(DATEDIFF(unique_lots.dateFin, unique_lots.dateDebut)), 0) as avg_duration,
        COUNT(CASE WHEN unique_lots.dateFin IS NOT NULL AND unique_lots.quantite > 0 THEN 1 END) as successful_lots,
        COUNT(*) as total_lots_for_rate
      FROM (
        SELECT DISTINCT l.id, l.dateDebut, l.dateFin, l.quantite
        FROM environnements_lots el
        INNER JOIN lots l ON l.id = el.lotId
        WHERE el.environnementId = ? AND l.userId = ?
        UNION
        SELECT DISTINCT l.id, l.dateDebut, l.dateFin, l.quantite
        FROM lot_action la
        INNER JOIN lots l ON l.id = la.lotId
        WHERE (la.OldEnv = ? OR la.NewEnv = ?) AND l.userId = ?
      ) unique_lots
    `, [id, userId, id, id, userId]);

    const successRate = performanceStats[0].total_lots_for_rate > 0
      ? Math.round((performanceStats[0].successful_lots / performanceStats[0].total_lots_for_rate) * 100 * 10) / 10
      : 0;

    return {
      current_lots: currentLots[0].count || 0,
      total_lots_history: historyLots[0].count || 0,
      completed_lots: completedLots[0].count || 0,
      total_plants: totalPlants[0].total || 0,
      total_yield_g: parseFloat(totalYield[0].total) || 0,
      avg_yield_per_lot: parseFloat(avgYield[0].avg) || 0,
      avg_duration_days: Math.round(performanceStats[0].avg_duration) || 0,
      success_rate: successRate
    };
  }

  async getEnvironmentConditionsSummary(id: number, userId: number): Promise<any> {
    // Vérifier que l'utilisateur a accès à cet environnement
    const environment = await this.environmentsRepository.findOne({
      where: { id: id, userId: userId }
    });

    if (!environment) {
      throw new NotFoundException("Environnement non trouvé");
    }

    const summary = await this.conditionEnvironnementalesRepository.query(`
      SELECT
        ROUND(AVG(ce.temperature), 1) as avg_temperature,
        ROUND(AVG(ce.humidite), 1) as avg_humidity,
        MIN(ce.temperature) as min_temperature,
        MAX(ce.temperature) as max_temperature,
        MIN(ce.humidite) as min_humidity,
        MAX(ce.humidite) as max_humidity,
        MAX(ce.date_heure) as last_update
      FROM conditions_environnementales ce
      WHERE ce.environnementId = ?
    `, [id]);

    const result = summary[0];
    return {
      avg_temperature: parseFloat(result.avg_temperature) || 0,
      avg_humidity: parseFloat(result.avg_humidity) || 0,
      min_temperature: parseFloat(result.min_temperature) || 0,
      max_temperature: parseFloat(result.max_temperature) || 0,
      min_humidity: parseFloat(result.min_humidity) || 0,
      max_humidity: parseFloat(result.max_humidity) || 0,
      last_update: result.last_update
    };
  }

  async getEnvironmentCurrentLots(id: number, userId: number): Promise<any> {
    // Vérifier que l'utilisateur a accès à cet environnement
    const environment = await this.environmentsRepository.findOne({
      where: { id: id, userId: userId }
    });

    if (!environment) {
      throw new NotFoundException("Environnement non trouvé");
    }

    const lots = await this.lotRepository.query(`
      SELECT
        l.id,
        l.nom,
        l.etapeCulture,
        l.planteQuantite,
        l.quantite,
        l.createdAt as created_at,
        v.nom as variete_nom,
        v.type as variete_type
      FROM environnements_lots el
      INNER JOIN lots l ON l.id = el.lotId
      INNER JOIN varietes v ON l.varieteId = v.id
      WHERE el.environnementId = ?
        AND l.userId = ?
        AND el.date_sortie IS NULL
        AND l.etapeCulture NOT IN ('sechage', 'maturation')
      ORDER BY l.createdAt DESC
    `, [id, userId]);

    return lots.map(lot => ({
      id: lot.id,
      nom: lot.nom,
      variete: {
        nom: lot.variete_nom,
        type: lot.variete_type
      },
      etapeCulture: lot.etapeCulture,
      planteQuantite: lot.planteQuantite,
      quantite: lot.quantite,
      created_at: lot.created_at
    }));
  }

  async getEnvironmentLotsHistory(id: number, userId: number): Promise<any> {
    // Vérifier que l'utilisateur a accès à cet environnement
    const environment = await this.environmentsRepository.findOne({
      where: { id: id, userId: userId }
    });

    if (!environment) {
      throw new NotFoundException("Environnement non trouvé");
    }

    const lots = await this.lotRepository.query(`
      SELECT DISTINCT
        l.id,
        l.nom,
        l.etapeCulture,
        l.planteQuantite,
        l.quantite,
        l.createdAt as created_at,
        v.nom as variete_nom,
        v.type as variete_type,
        CASE
          WHEN el_current.environnementId = ? AND el_current.date_sortie IS NULL THEN 'current'
          ELSE 'historical'
        END as status
      FROM lots l
      INNER JOIN varietes v ON l.varieteId = v.id
      LEFT JOIN environnements_lots el ON el.lotId = l.id AND el.environnementId = ?
      LEFT JOIN environnements_lots el_current ON el_current.lotId = l.id AND el_current.date_sortie IS NULL
      LEFT JOIN lot_action la ON la.lotId = l.id
      WHERE l.userId = ?
        AND (el.environnementId = ? OR la.OldEnv = ? OR la.NewEnv = ?)
      ORDER BY l.createdAt DESC
    `, [id, id, userId, id, id, id]);

    return lots.map(lot => ({
      id: lot.id,
      nom: lot.nom,
      variete: {
        nom: lot.variete_nom,
        type: lot.variete_type
      },
      etapeCulture: lot.etapeCulture,
      planteQuantite: lot.planteQuantite,
      quantite: lot.quantite,
      created_at: lot.created_at,
      status: lot.status
    }));
  }

  async getEnvironmentMonthlyPerformance(id: number, userId: number): Promise<any> {
    // Vérifier que l'utilisateur a accès à cet environnement
    const environment = await this.environmentsRepository.findOne({
      where: { id: id, userId: userId }
    });

    if (!environment) {
      throw new NotFoundException("Environnement non trouvé");
    }

    const performance = await this.lotRepository.query(`
      SELECT
        months.month,
        months.month_label,
        COALESCE(data.lots_completed, 0) as lots_completed,
        COALESCE(data.yield_g, 0) as yield_g,
        COALESCE(data.avg_duration, 0) as avg_duration
      FROM (
        SELECT
          DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL seq MONTH), '%Y-%m') as month,
          DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL seq MONTH), '%b') as month_label
        FROM (SELECT 0 as seq UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5) months
      ) months
      LEFT JOIN (
        SELECT
          DATE_FORMAT(l.dateFin, '%Y-%m') as month,
          COUNT(DISTINCT l.id) as lots_completed,
          SUM(l.quantite) as yield_g,
          ROUND(AVG(DATEDIFF(l.dateFin, l.dateDebut))) as avg_duration
        FROM environnements_lots el
        INNER JOIN lots l ON l.id = el.lotId
        WHERE el.environnementId = ?
          AND l.userId = ?
          AND l.dateFin IS NOT NULL
          AND l.dateFin >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(l.dateFin, '%Y-%m')
      ) data ON months.month = data.month
      ORDER BY months.month DESC
    `, [id, userId]);

    return {
      months: performance.reverse().map(month => ({
        month: month.month,
        month_label: month.month_label,
        lots_completed: month.lots_completed || 0,
        yield_g: parseFloat(month.yield_g) || 0,
        avg_duration: month.avg_duration || 0
      }))
    };
  }




}
