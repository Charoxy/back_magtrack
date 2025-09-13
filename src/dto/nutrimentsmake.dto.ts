import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateNutrimentsDto {
  @IsString()
  @IsNotEmpty()
  nom: string;

  @IsString()
  @IsNotEmpty()
  marque: string;

  @IsEnum(['minerale', 'organique', 'chimique'])
  type: 'minerale' | 'organique' | 'chimique';

  @IsOptional()
  @IsString()
  description?: string;
}
