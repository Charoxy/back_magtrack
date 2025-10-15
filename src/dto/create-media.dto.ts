import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateMediaDto {

  @ApiProperty({
    example: 'photo',
    description: 'Type de média',
    enum: ['photo', 'analyse']
  })
  @IsEnum(['photo', 'analyse'])
  @IsNotEmpty()
  type: string;

  @ApiProperty({
    example: 'Photo récolte lot #1',
    description: 'Nom du média'
  })
  @IsString()
  @IsNotEmpty()
  nom: string;

  @ApiProperty({
    example: 1,
    description: 'ID du lot associé'
  })
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @IsNotEmpty()
  lotId: number;

  @ApiProperty({
    example: 'Belle photo de la récolte',
    description: 'Description optionnelle',
    required: false
  })
  @IsString()
  @IsOptional()
  description?: string;

  // Le fichier sera envoyé via multipart/form-data
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Fichier à uploader (photo ou PDF)'
  })
  file: any;
}
