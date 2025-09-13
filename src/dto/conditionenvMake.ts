import { IsInt, IsNumber, IsOptional, IsString, IsDate, IsEnum, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateConditionEnvironnementaleDto {
  @IsInt()
  @IsNotEmpty()
  LotId: number; // On ne passe pas un objet complet, juste l'id

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  date_heure: Date;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 1 })
  temperature?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 1 })
  humidite?: number;

  @IsOptional()
  @IsInt()
  co2?: number;

  @IsOptional()
  @IsInt()
  lumiere?: number;

  @IsEnum(['manuel', 'capteur'])
  source: 'manuel' | 'capteur';

  @IsOptional()
  @IsString()
  commentaire?: string;
}
