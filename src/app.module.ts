import { Module } from '@nestjs/common';
import { EnvironmentsModule } from './environments/environments.module';
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConditionEnvironnementale } from "./entities/entitie.condition-environnementale";
import { Environnement } from "./entities/entitie.environements";
import { EnvironnementLot } from "./entities/entitie.environement-lot";
import { User } from "./entities/entitie.user";
import { Lot } from "./entities/entitie.lots";
import { Variete } from "./entities/entitie.variete";
import { VarieteModule } from './variete/variete.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { LotsModule } from './lots/lots.module';
import { LotAction } from "./entities/entitie.lots-action";
import { Nutriments } from "./entities/entitie.nutriments";
import { NutrimentAction } from "./entities/entitie.nutriments-action";
import { NutrimentsController } from './nutriments/nutriments.controller';
import { NutrimentsModule } from './nutriments/nutriments.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mariadb',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'magtrack',
      entities: [
        ConditionEnvironnementale,
        Environnement,
        EnvironnementLot,
        User,
        Lot,
        Variete,
        LotAction,
        Nutriments,
        NutrimentAction,
      ],
      synchronize: true,
    }),
    EnvironmentsModule,
    VarieteModule,
    AuthModule,
    UsersModule,
    LotsModule,
    NutrimentsModule,
  ],
})

export class AppModule {}
