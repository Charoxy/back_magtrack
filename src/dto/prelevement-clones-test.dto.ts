import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PrelevementClonesTestDto {

  @ApiProperty({
    example: 'Clones test - Purple Haze',
    description: 'Nom du lot de clones test'
  })
  @IsString()
  @IsNotEmpty()
  nom: string;

  @ApiProperty({
    example: 8,
    description: 'ID du lot de graines parent'
  })
  @IsNumber()
  @IsNotEmpty()
  lotGrainesId: number;

  @ApiProperty({
    example: 2,
    description: 'ID de l\'environnement pour les clones'
  })
  @IsNumber()
  @IsNotEmpty()
  environmentId: number;

  @ApiProperty({
    example: 16,
    description: 'Nombre de clones'
  })
  @IsNumber()
  @IsNotEmpty()
  nombreClones: number;

  @ApiProperty({
    example: '2024-03-15',
    description: 'Date de début du lot'
  })
  @IsString()
  dateDebut: string;

  @ApiProperty({
    example: 'coco',
    enum: ['terre', 'hydroponie', 'living soil', 'coco'],
    description: 'Type de substrat',
    required: false
  })
  @IsOptional()
  @IsEnum(['terre', 'hydroponie', 'living soil', 'coco'])
  substrat?: string;

  @ApiProperty({
    example: 'Prélèvement pour sélection phénotypique',
    description: 'Description du lot de clones',
    required: false
  })
  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateLotFromMotherDto {

  @ApiProperty({
    example: 'Production Purple Haze Batch #3',
    description: 'Nom du lot de production'
  })
  @IsString()
  @IsNotEmpty()
  nom: string;

  @ApiProperty({
    example: 5,
    description: 'ID du pied mère'
  })
  @IsNumber()
  @IsNotEmpty()
  piedMereId: number;

  @ApiProperty({
    example: 50,
    description: 'Nombre de plants à cloner'
  })
  @IsNumber()
  @IsNotEmpty()
  nombreClones: number;

  @ApiProperty({
    example: '2024-04-01',
    description: 'Date de début du lot'
  })
  @IsString()
  @IsNotEmpty()
  dateDebut: string;

  @ApiProperty({
    example: 4,
    description: 'ID de l\'environnement'
  })
  @IsNumber()
  @IsNotEmpty()
  environmentId: number;

  @ApiProperty({
    example: 'coco',
    enum: ['terre', 'hydroponie', 'living soil', 'coco'],
    description: 'Type de substrat',
    required: false
  })
  @IsOptional()
  @IsEnum(['terre', 'hydroponie', 'living soil', 'coco'])
  substrat?: string;

  @ApiProperty({
    example: 'Batch de production pour le marché',
    description: 'Description du lot',
    required: false
  })
  @IsOptional()
  @IsString()
  description?: string;
}
