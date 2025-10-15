import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EvaluationsService } from './evaluations.service';
import { EvaluationsController } from './evaluations.controller';
import { EvaluationPlant } from '../entities/entitie.evaluation-plant';
import { Lot } from '../entities/entitie.lots';
import { PiedMere } from '../entities/entitie.pied-mere';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EvaluationPlant,
      Lot,
      PiedMere,
    ]),
  ],
  controllers: [EvaluationsController],
  providers: [EvaluationsService],
  exports: [EvaluationsService],
})
export class EvaluationsModule {}
