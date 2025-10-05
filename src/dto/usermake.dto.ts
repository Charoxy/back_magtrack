import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'john@example.com', description: 'Email de l\'utilisateur' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', description: 'Mot de passe (minimum 6 caractères)', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'John Doe', description: 'Nom complet de l\'utilisateur' })
  @IsString()
  @IsNotEmpty()
  nom: string;

  @ApiProperty({ example: 'Ma Ferme', description: 'Nom de l\'organisation' })
  @IsString()
  @IsNotEmpty()
  organisation: string;

  @ApiProperty({ example: true, description: 'Si true = producteur, si false = non_producteur', required: false })
  @IsOptional()
  @IsBoolean()
  isproducteur?: boolean;
}
