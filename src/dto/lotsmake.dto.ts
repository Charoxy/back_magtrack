import { IsString, IsUUID, IsOptional, IsDateString, IsNumber, IsInt } from "class-validator";

export class CreateLotDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsDateString()
  dateDebut: String;

  @IsInt()
  varietyId: number;

  @IsInt()
  PlanteQuantite: number;

  @IsInt()
  environmentId: number;
}
