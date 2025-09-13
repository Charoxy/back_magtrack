import { Module } from '@nestjs/common';
import { VarieteController } from './variete.controller';
import { VarieteService } from './variete.service';
import { Variete } from "../entities/entitie.variete";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
  imports: [TypeOrmModule.forFeature([Variete])],
  controllers: [VarieteController],
  providers: [VarieteService],
  exports: [VarieteService]
})
export class VarieteModule {}
