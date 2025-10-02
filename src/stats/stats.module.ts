import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { Lot } from '../entities/entitie.lots';

@Module({
  imports: [TypeOrmModule.forFeature([Lot])],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}