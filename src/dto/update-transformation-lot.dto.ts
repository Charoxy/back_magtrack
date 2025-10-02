import { IsString, IsOptional, IsNumber, Min, Max } from "class-validator";

export class UpdateTransformationLotDto {
  @IsOptional()
  @IsString()
  nom?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  rendement?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  methode_extraction?: string;
}