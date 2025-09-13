import { ForbiddenException, HttpCode, HttpException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { Lot } from "../entities/entitie.lots";
import { IsNull, Not, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateLotDto } from "../dto/lotsmake.dto";
import { VarieteService } from "../variete/variete.service";
import { EnvironmentsService } from 'src/environments/environments.service';
import { EnvironnementLot } from "../entities/entitie.environement-lot";
import { UsersService } from "../users/users.service";
import { LotAction } from "../entities/entitie.lots-action";
import { CreateLotActionDto } from "../dto/create-lot-action.dto";
import { NutrimentAction } from "../entities/entitie.nutriments-action";
import { ChangeEnvDTO } from "../dto/change-env.dto";

@Injectable()
export class LotsService {

  constructor(
    @InjectRepository(Lot)
    private readonly lotRepository: Repository<Lot>,

    @InjectRepository(LotAction)
    private readonly lotActionRepository: Repository<LotAction>,

    private varieteService: VarieteService,
    private environementService: EnvironmentsService,
  ) { }

  async findAll(userId: number): Promise<Lot[]> {
    return await this.lotRepository.find({ where: { userId: userId } });
  }

  async findOne(id: number, userId: number): Promise<any> {

    const lot = await this.lotRepository.findOne({ where: { id: id }});
    const envlot = await this.lotRepository.query(`SELECT * FROM environnements_lots WHERE lotId = ? And date_sortie IS NULL`, [id]);


    if(lot.userId != userId) {
      throw new HttpException("Vous n'avez pas accès à cette ressource", HttpStatus.FORBIDDEN);
    }
    return {...lot, environnements: envlot[0].environnementId};

  }

  async getActions(idLot: number, userId: number): Promise<LotAction[]> {

    const lot = await this.lotRepository.findOne({ where: { id: idLot }});

    if (!lot) {
      throw new HttpException("Lot non trouvé", HttpStatus.NOT_FOUND);
    }

    if(lot.userId != userId) {
      throw new HttpException("Vous n'avez pas accès à cette ressource", HttpStatus.FORBIDDEN);
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

    // 🔁 Changer la stage
    if(action.stage){
      actionToSave.stage = action.stage;

      await this.lotRepository.update(actionToSave.lotId, {
        etapeCulture: action.stage
      });
    }

    if(action.OldEnv != null && action.NewEnv != null){
      let etape = action.stage == 'croissance' || 'floraison' || 'semi' ? 'culture' : action.stage;

      console.log(etape)
      let environmentLot = new EnvironnementLot();
      environmentLot.lotId = actionToSave.lotId;
      environmentLot.environnementId = action.NewEnv;
      environmentLot.etape = etape;
      environmentLot.date_entree = new Date(action.date);
      environmentLot.date_sortie = null;
      environmentLot.commentaire = null;
      await this.environementService.makeEnvironmentLot(environmentLot);

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

    let newLot = new Lot();
    newLot.userId = userid
    newLot.nom = lot.name;
    newLot.description = lot.description;
    newLot.dateDebut = new Date(String(lot.dateDebut));
    newLot.variete = await this.varieteService.getVarieteById(lot.varietyId);
    newLot.planteQuantite = lot.PlanteQuantite;
    const lots = await this.lotRepository.save(newLot);

    let newEnvLot = new EnvironnementLot();
    newEnvLot.lotId = lots.id;
    newEnvLot.environnementId = lot.environmentId;
    newEnvLot.etape = 'culture';
    newEnvLot.date_entree = new Date();
    newEnvLot.date_sortie = null;
    newEnvLot.commentaire = null;

    await this.environementService.makeEnvironmentLot(newEnvLot)

    return lots;

  }

  async findActif(userId: number): Promise<Lot[]> {
    return await this.lotRepository.find({ where: { userId: userId, dateFin: IsNull() } });
  }

  async findOld(userId: number): Promise<Lot[]> {
    return await this.lotRepository.find({ where: { userId: userId,  dateFin: Not(IsNull()) } });
  }

}
