import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateVarieteDto {
  @IsString()
  nom: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  origine: string;

  @IsString()
  breeder: string;

  @IsString()
  type: string;

  @IsNumber()
  tauxTHC: number;

  @IsNumber()
  tauxCBD: number;
}
