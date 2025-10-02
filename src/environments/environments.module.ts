import { Module } from '@nestjs/common';
import { EnvironmentsService } from './environments.service';
import { EnvironmentsController } from './environments.controller';
import { TypeOrmModule } from "@nestjs/typeorm";
import { Environnement } from "../entities/entitie.environements";
import { EnvironnementLot } from "../entities/entitie.environement-lot";
import { ConditionEnvironnementale } from "../entities/entitie.condition-environnementale";
import { Lot } from "../entities/entitie.lots";

@Module({
  imports: [TypeOrmModule.forFeature([Environnement, EnvironnementLot, ConditionEnvironnementale, Lot])],
  providers: [EnvironmentsService],
  controllers: [EnvironmentsController],
  exports: [EnvironmentsService]
})
export class EnvironmentsModule {}
