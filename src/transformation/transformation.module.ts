import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransformationController } from './transformation.controller';
import { TransformationService } from './transformation.service';
import { LotTransformation } from '../entities/entitie.lots-transformation';
import { LotTransformationSource } from '../entities/entitie.lots-transformation-sources';
import { Lot } from '../entities/entitie.lots';
import { StockModule } from '../stock/stock.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LotTransformation, LotTransformationSource, Lot]),
    StockModule,
  ],
  controllers: [TransformationController],
  providers: [TransformationService],
  exports: [TransformationService],
})
export class TransformationModule {}