import { IsNumber } from 'class-validator';

export class CreateNutrimentActionDto {
  @IsNumber()
  nutrimentId: number;

  @IsNumber()
  dosage: number; // en mL/L par exemple
}
