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
import { StatsModule } from './stats/stats.module';
import { ProducerProgress } from './entities/entitie.producer-progress';
import { ProducerProgressModule } from './producer-progress/producer-progress.module';
import { StockMovement } from './entities/entitie.stock-movement';
import { StockModule } from './stock/stock.module';
import { LotTransformation } from './entities/entitie.lots-transformation';
import { LotTransformationSource } from './entities/entitie.lots-transformation-sources';
import { TransformationModule } from './transformation/transformation.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      expandVariables: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mariadb',
        host: configService.get('DB_HOST') || 'localhost',
        port: configService.get('DB_PORT') || 3306,
        username: configService.get('DB_USERNAME') || 'root',
        password: configService.get('DB_PASSWORD') || 'root',
        database: configService.get('DB_DATABASE') || 'magtrack',
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
          ProducerProgress,
          StockMovement,
          LotTransformation,
          LotTransformationSource,
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
    StatsModule,
    ProducerProgressModule,
    StockModule,
    TransformationModule,
  ],
})

export class AppModule {}
