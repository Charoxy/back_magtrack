import { Module } from '@nestjs/common';
import { NutrimentsService } from './nutriments.service';
import { TypeOrmModule } from "@nestjs/typeorm";
import { Nutriments } from "../entities/entitie.nutriments";
import { NutrimentsController } from "./nutriments.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Nutriments])],
  controllers: [NutrimentsController],
  providers: [NutrimentsService]
})
export class NutrimentsModule {}
