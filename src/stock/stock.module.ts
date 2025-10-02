import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockController } from './stock.controller';
import { StockService } from './stock.service';
import { StockMovement } from '../entities/entitie.stock-movement';
import { Lot } from '../entities/entitie.lots';
import { Variete } from '../entities/entitie.variete';
import { LotTransformation } from '../entities/entitie.lots-transformation';

@Module({
  imports: [TypeOrmModule.forFeature([StockMovement, Lot, Variete, LotTransformation])],
  controllers: [StockController],
  providers: [StockService],
  exports: [StockService]
})
export class StockModule {}