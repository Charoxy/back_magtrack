import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePiedMereDto {

  @ApiProperty({
    example: 'PM Purple Haze - Phéno #5',
    description: 'Nom du pied mère'
  })
  @IsString()
  @IsNotEmpty()
  nom: string;

  @ApiProperty({
    example: 2,
    description: 'ID du lot de clones test'
  })
  @IsNumber()
  @IsNotEmpty()
  lotClonesTestId: number;

  @ApiProperty({
    example: 5,
    description: 'Index du clone à transformer (1-16)'
  })
  @IsNumber()
  @IsNotEmpty()
  plantIndex: number;

  @ApiProperty({
    example: 1,
    description: 'ID du lot de graines d\'origine'
  })
  @IsNumber()
  @IsNotEmpty()
  lotGrainesId: number;

  @ApiProperty({
    example: 5,
    description: 'Index du plant dans le lot de graines (1-16)'
  })
  @IsNumber()
  @IsNotEmpty()
  plantGrainesIndex: number;

  @ApiProperty({
    example: 3,
    description: 'ID de l\'environnement où sera cultivé le pied mère'
  })
  @IsNumber()
  @IsNotEmpty()
  environnementId: number;

  @ApiProperty({
    example: 5,
    description: 'ID de l\'évaluation du plant (pour copier les notes)',
    required: false
  })
  @IsOptional()
  @IsNumber()
  evaluationId?: number;

  @ApiProperty({
    example: 'Excellent phénotype, très résineux',
    description: 'Description du pied mère',
    required: false
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 'Goût fruité, grosse tête, pousse rapide',
    description: 'Caractéristiques du phénotype',
    required: false
  })
  @IsOptional()
  @IsString()
  caracteristiques?: string;
}

export class UpdatePiedMereDto {

  @ApiProperty({
    example: 'PM Purple Haze - Phéno #5 (Updated)',
    required: false
  })
  @IsOptional()
  @IsString()
  nom?: string;

  @ApiProperty({
    example: 3,
    required: false
  })
  @IsOptional()
  @IsNumber()
  environnementId?: number;

  @ApiProperty({
    required: false
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    required: false
  })
  @IsOptional()
  @IsString()
  caracteristiques?: string;
}

export class ChangeStatutDto {

  @ApiProperty({
    example: 'repos',
    enum: ['actif', 'repos', 'retiré'],
    description: 'Nouveau statut du pied mère'
  })
  @IsString()
  @IsNotEmpty()
  statut: 'actif' | 'repos' | 'retiré';
}
