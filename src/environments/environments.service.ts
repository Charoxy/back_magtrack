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

@Injectable()
export class EnvironmentsService {

  constructor(
    @InjectRepository(Environnement)
    private readonly environmentsRepository: Repository<Environnement>,

    @InjectRepository(EnvironnementLot)
    private readonly environnementsLotsRepository: Repository<EnvironnementLot>,

    @InjectRepository(ConditionEnvironnementale)
    private readonly conditionEnvironnementalesRepository: Repository<ConditionEnvironnementale>,
  ) {
  }

  async getAllEnvironments(): Promise<Environnement[]> {
    return this.environmentsRepository.find();
  }

  async getAllEnvironmentsWithLots(userid: number): Promise<Environnement[]> {
    return this.environmentsRepository.find(
      {
        where: { userId:  userid },
        relations: ['lots_associes','lots_associes.lot']
      }
    );
  }

  async isTodayConditionsIsSubmitted(id: number): Promise<boolean> {
      const condition = await this.conditionEnvironnementalesRepository.findOne({where: {environnementId: id}, order: {date_heure: 'DESC'}});

      if(condition == null || condition.date_heure.toISOString().substring(0,10) != new Date().toISOString().substring(0,10)){
          return false;
      }
      else return condition.date_heure.toISOString().substring(0,10) == new Date().toISOString().substring(0,10);
  }

  async getEnvironmentLots(id: number): Promise<EnvironnementLot[]> {
    return this.environnementsLotsRepository.find({where: {lotId: id}});
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

      return  await this.environmentsRepository.save(env);
  }

  async getEnvironmentById(id: number): Promise<Environnement> {
    return this.environmentsRepository.findOne({where: {id: id}});
  }

  async makeEnvironmentLot(lot: EnvironnementLot){

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
    conditionEnv.date_heure = moment(condition.date_heure).tz("Europe/Paris").toDate();
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




}
