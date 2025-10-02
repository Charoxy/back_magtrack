import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { ConditionEnvironnementale } from '../entities/entitie.condition-environnementale';
import { Environnement } from '../entities/entitie.environements';
import { EnvironnementLot } from '../entities/entitie.environement-lot';
import { User } from '../entities/entitie.user';
import { Lot } from '../entities/entitie.lots';
import { Variete } from '../entities/entitie.variete';
import { LotAction } from '../entities/entitie.lots-action';
import { Nutriments } from '../entities/entitie.nutriments';
import { NutrimentAction } from '../entities/entitie.nutriments-action';
import { ShareLots } from '../entities/entitie.share-lots';
import { ProducerProgress } from '../entities/entitie.producer-progress';
import { StockMovement } from '../entities/entitie.stock-movement';
import { LotTransformation } from '../entities/entitie.lots-transformation';
import { LotTransformationSource } from '../entities/entitie.lots-transformation-sources';

// Charger les variables d'environnement
config({ path: '.env.local' });

export const AppDataSource = new DataSource({
  type: 'mariadb',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_DATABASE || 'magtrack',
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
  migrations: [__dirname + '/../migrations/*.{ts,js}'],
  migrationsTableName: 'typeorm_migrations',
  synchronize: false, // Désactivé car on utilise les migrations
});
