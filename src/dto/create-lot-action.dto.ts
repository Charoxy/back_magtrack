import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsArray,
  ValidateNested,
  IsDateString, IsInt, IsIn
} from "class-validator";
import { Type } from 'class-transformer';
import { CreateNutrimentActionDto } from './create-nutriment-action.dto';

export class CreateLotActionDto {

  @IsString()
  type: string; // ex: 'engrais', 'arrosage', etc.

  @IsEnum(['semi', 'croissance', 'floraison', 'maturation', 'sechage'])
  @IsOptional()
  stage?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  quantity?: number;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsInt()
  OldEnv?: number;

  @IsOptional()
  @IsInt()
  NewEnv?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateNutrimentActionDto)
  engraisUtilises?: CreateNutrimentActionDto[];
}
