import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMediaDto {

  @ApiProperty({
    example: 'Photo récolte lot #1 (mise à jour)',
    description: 'Nouveau nom du média',
    required: false
  })
  @IsString()
  @IsOptional()
  nom?: string;

  @ApiProperty({
    example: 'Nouvelle description',
    description: 'Nouvelle description',
    required: false
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Nouveau fichier (optionnel)',
    required: false
  })
  @IsOptional()
  file?: any;
}
