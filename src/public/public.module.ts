import { Module } from '@nestjs/common';
import { PublicService } from './public.service';
import { PublicController } from './public.controller';
import { EnvironmentsService } from 'src/environments/environments.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Environnement } from 'src/entities/entitie.environements';
import { EnvironnementLot } from 'src/entities/entitie.environement-lot';
import { Lot } from 'src/entities/entitie.lots';
import { LotAction } from 'src/entities/entitie.lots-action';
import { ConditionEnvironnementale } from 'src/entities/entitie.condition-environnementale';
import { ShareLots } from 'src/entities/entitie.share-lots';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      // Entities that should be available in the PublicModule
      Environnement,
      EnvironnementLot,
      ConditionEnvironnementale,
      Lot,
      LotAction,
      ShareLots

    ])
  ],
  providers: [PublicService],
  controllers: [PublicController]
})
export class PublicModule {}
