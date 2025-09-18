import { Module } from '@nestjs/common';
import { LotsController } from './lots.controller';
import { LotsService } from './lots.service';
import { Lot } from "../entities/entitie.lots";
import { TypeOrmModule } from '@nestjs/typeorm';
import { VarieteModule } from "../variete/variete.module";
import { EnvironmentsModule } from "../environments/environments.module";
import { UsersModule } from 'src/users/users.module';
import { LotAction } from "../entities/entitie.lots-action";
import { ShareLots } from 'src/entities/entitie.share-lots';

@Module({
  imports: [TypeOrmModule.forFeature([Lot, LotAction, ShareLots]), VarieteModule, EnvironmentsModule, UsersModule],
  controllers: [LotsController],
  providers: [LotsService]
})
export class LotsModule {}
