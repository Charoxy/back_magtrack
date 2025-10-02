import { Module } from '@nestjs/common';
import { EnvironmentsModule } from './environments/environments.module';
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from '@nestjs/config';
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
import { ShareLots } from './entities/entitie.share-lots';
import { PublicModule } from './public/public.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.local',
      ignoreEnvFile: process.env.NODE_ENV === 'production',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mariadb',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
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
          ShareLots,
        ],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    EnvironmentsModule,
    VarieteModule,
    AuthModule,
    UsersModule,
    LotsModule,
    NutrimentsModule,
    PublicModule,
  ],
})

export class AppModule {}
