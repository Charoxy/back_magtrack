import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsDate,
  IsEnum,
  IsNotEmpty,
  isInt,
  IsDateString
} from "class-validator";
import { Type } from 'class-transformer';

export class ChangeEnvDTO {

  @IsInt()
  @IsNotEmpty()
  lot: number; // On ne passe pas un objet complet, juste l'id

  @IsInt()
  @IsNotEmpty()
  newEnv: number;

  @IsDateString()
  @IsNotEmpty()
  date: string;

}
