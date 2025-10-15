import { IsString, IsUUID, IsOptional, IsDateString, IsNumber, IsInt, IsEnum } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateLotDto {
  @ApiProperty({ example: 'Purple Haze #1', description: 'Nom du lot' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Lot de test', description: 'Description du lot' })
  @IsString()
  description: string;

  @ApiProperty({ example: '2024-01-15', description: 'Date de début' })
  @IsDateString()
  dateDebut: String;

  @ApiProperty({ example: 1, description: 'ID de la variété' })
  @IsInt()
  varietyId: number;

  @ApiProperty({ example: 10, description: 'Quantité de plantes' })
  @IsInt()
  PlanteQuantite: number;

  @ApiProperty({ example: 1, description: 'ID de l\'environnement' })
  @IsInt()
  environmentId: number;

  @ApiProperty({
    example: 'terre',
    description: 'Type de substrat utilisé',
    enum: ['terre', 'hydroponie', 'living soil', 'coco'],
    required: false
  })
  @IsOptional()
  @IsEnum(['terre', 'hydroponie', 'living soil', 'coco'])
  substrat?: string;

  @ApiProperty({
    example: 'graine',
    description: 'Origine du lot',
    enum: ['graine', 'clone_production'],
    required: false
  })
  @IsOptional()
  @IsEnum(['graine', 'clone_production'])
  origine?: string;

  @ApiProperty({
    example: 5,
    description: 'ID du pied mère (required si origine = clone_production)',
    required: false
  })
  @IsOptional()
  @IsNumber()
  piedMereId?: number;
}
