import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import e from 'express';
import { ConditionEnvironnementale } from 'src/entities/entitie.condition-environnementale';
import { EnvironnementLot } from 'src/entities/entitie.environement-lot';
import { Environnement } from 'src/entities/entitie.environements';
import { Lot } from 'src/entities/entitie.lots';
import { LotAction } from 'src/entities/entitie.lots-action';
import { ShareLots } from 'src/entities/entitie.share-lots';
import { EnvironmentsService } from 'src/environments/environments.service';
import { VarieteService } from 'src/variete/variete.service';
import { Between, Repository } from 'typeorm';

@Injectable()
export class PublicService {

    constructor(           
        @InjectRepository(Lot)
        private readonly lotRepository: Repository<Lot>,
        
        @InjectRepository(LotAction)
        private readonly lotActionRepository: Repository<LotAction>,
        
        @InjectRepository(ShareLots)
        private readonly shareLotsRepository: Repository<ShareLots>,

        @InjectRepository(Environnement)
        private readonly environnementRepository: Repository<Environnement>,

        @InjectRepository(EnvironnementLot)
        private readonly environnementLotRepository: Repository<EnvironnementLot>,

        @InjectRepository(ConditionEnvironnementale)
        private readonly conditionEnvironnementaleRepository: Repository<ConditionEnvironnementale>,
    ) {}

    async isPublicLot(id: string): Promise<boolean> {
        return await this.shareLotsRepository.findOne({ where: { id : id } }) != null;
    }

    async getPublicLots(id: string): Promise<any> {
    
        if(this.isPublicLot(id)){

        const sharelots = await this.shareLotsRepository.findOne({ where: { id : id }, relations: ['lot', 'lot.environnements_lots'] });

        let cultureType = null;

        await Promise.all(sharelots.lot.environnements_lots.map(async (envLot) => {
            const env = await this.environnementRepository.findOne({ where: { id: envLot.environnementId } });
            envLot.environnement = env;

            if (env.type === 'culture') {
                if (cultureType == null) {
                    cultureType = env.culture_type;
                } else if (cultureType !== env.culture_type) {
                    cultureType = "Mixte";
                }
            }
        }));

        
        return {
            name : sharelots.lot.nom,
            id : sharelots.lot.id,
            environnements : sharelots.lot.environnements_lots,
            variete : sharelots.lot.variete,
            date_debut : sharelots.lot.dateDebut,
            date_fin : sharelots.lot.dateFin,
            culture_type : cultureType
        }

        }

        throw new HttpException("Lot non trouvé", HttpStatus.NOT_FOUND);

  }

    async getStageStartDates(lotid: number): Promise<{ stage: string; date: Date }[]> {
        // On récupère toutes les actions "stage" d’un lot
        const actions = await this.lotActionRepository.find({
            where: { lotId: lotid, type: 'stage' },
            order: { date: 'ASC' }
        });

        // On retourne uniquement stage + date
        return actions.map(action => ({
            stage: action.stage,
            date: new Date(action.date) // pour être sûr qu’on a bien un objet Date
        }));
    }



async getMoyenneConditions(id: string): Promise<any> {
    const shareLot = await this.shareLotsRepository.findOne({
        where: { id },
        relations: ['lot', 'lot.actions', 'lot.environnements_lots'],
    });

    if (!shareLot) {
        throw new Error("Lot non trouvé");
    }

    const lot = shareLot.lot;

    const actions = await this.lotActionRepository.find({ where: { lotId: lot.id , type: 'stage' }, order: { date: 'ASC' } });

    const result = await Promise.all(actions.map(async (action, index) => {
        const dateOfStage = new Date(action.date);
        const endOfStage = index + 1 >= actions.length
            ? new Date()
            : new Date(actions[index + 1].date);

        let env = await this.environnementLotRepository.query(
            `SELECT * FROM environnements_lots e WHERE e.lotId = ? AND e.date_entree = ? LIMIT 1`,
            [lot.id, dateOfStage.toISOString().substring(0, 10)]
        );

        if (env.length === 0) {
            env = await this.environnementLotRepository.query(
                `SELECT * FROM environnements_lots e WHERE e.lotId = ? Order by e.date_entree DESC LIMIT 1`,
                [lot.id]
            );
        }

        const envConditions = await this.conditionEnvironnementaleRepository.query(
            `SELECT AVG(temperature) as temperature, AVG(humidite) as humidite
            FROM conditions_environnementales c
            WHERE c.environnementId = ?
            AND DATE(c.date_heure) >= ?
            AND DATE(c.date_heure) <= ?
            ORDER BY c.date_heure ASC`,
            [env[0].environnementId, dateOfStage.toISOString().substring(0, 10), endOfStage.toISOString().substring(0, 10)]
        );

        return envConditions.map((condition) => ({
            stage: action.stage,
            temperature: condition.temperature,
            humidite: condition.humidite
        }));


    }));

    // Aplatis les tableaux imbriqués
    return result.flat();
}



}
