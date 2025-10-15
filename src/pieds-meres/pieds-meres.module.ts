import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PiedsMeresService } from './pieds-meres.service';
import { PiedsMeresController } from './pieds-meres.controller';
import { PiedMere } from '../entities/entitie.pied-mere';
import { Lot } from '../entities/entitie.lots';
import { EvaluationPlant } from '../entities/entitie.evaluation-plant';
import { Variete } from '../entities/entitie.variete';
import { Environnement } from '../entities/entitie.environements';
import { LotAction } from '../entities/entitie.lots-action';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PiedMere,
      Lot,
      EvaluationPlant,
      Variete,
      Environnement,
      LotAction,
    ]),
  ],
  controllers: [PiedsMeresController],
  providers: [PiedsMeresService],
  exports: [PiedsMeresService],
})
export class PiedsMeresModule {}
