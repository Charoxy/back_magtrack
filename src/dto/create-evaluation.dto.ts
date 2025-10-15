import { IsNumber, IsNotEmpty, IsOptional, IsString, IsBoolean, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEvaluationDto {

  @ApiProperty({
    example: 1,
    description: 'ID du lot évalué'
  })
  @IsNumber()
  @IsNotEmpty()
  lotId: number;

  @ApiProperty({
    example: 5,
    description: 'Index du plant dans le lot (1-16)'
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  plantIndex: number;

  @ApiProperty({
    example: 'Plant #5',
    description: 'Marqueur du plant (A, B, ★, etc.)',
    required: false
  })
  @IsOptional()
  @IsString()
  marqueur?: string;

  @ApiProperty({
    example: 9,
    description: 'Note globale du plant (0-10)'
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Max(10)
  noteGlobale: number;

  @ApiProperty({
    example: 9,
    description: 'Note de puissance (0-10)',
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  notePuissance?: number;

  @ApiProperty({
    example: 8,
    description: 'Note de goût (0-10)',
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  noteGout?: number;

  @ApiProperty({
    example: 9,
    description: 'Note de rendement (0-10)',
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  noteRendement?: number;

  @ApiProperty({
    example: 85.5,
    description: 'Poids récolté en grammes',
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  poidsRecolte?: number;

  @ApiProperty({
    example: 22.5,
    description: 'Taux de THC en pourcentage',
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  tauxTHC?: number;

  @ApiProperty({
    example: 0.8,
    description: 'Taux de CBD en pourcentage',
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  tauxCBD?: number;

  @ApiProperty({
    example: 'Très résineux, goût fruité, croissance rapide',
    description: 'Notes et observations',
    required: false
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    example: false,
    description: 'Le plant a-t-il été sélectionné comme pied mère ?',
    required: false
  })
  @IsOptional()
  @IsBoolean()
  selectionne?: boolean;
}

export class CreateBulkEvaluationsDto {

  @ApiProperty({
    example: 1,
    description: 'ID du lot évalué'
  })
  @IsNumber()
  @IsNotEmpty()
  lotId: number;

  @ApiProperty({
    type: [CreateEvaluationDto],
    description: 'Liste des évaluations'
  })
  @IsNotEmpty()
  evaluations: Omit<CreateEvaluationDto, 'lotId'>[];
}

export class UpdateEvaluationDto {

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  marqueur?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  noteGlobale?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  notePuissance?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  noteGout?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  noteRendement?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  poidsRecolte?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  tauxTHC?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  tauxCBD?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
