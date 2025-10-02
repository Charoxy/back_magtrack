import { IsNumber, IsPositive, IsString, IsOptional, IsEnum } from "class-validator";

export class StockMovementDto {
  @IsNumber()
  @IsPositive()
  quantity: number;

  @IsEnum(['add', 'remove'])
  operation: 'add' | 'remove';

  @IsOptional()
  @IsString()
  reason?: string; // Motif du mouvement (vente, perte, ajout, etc.)

  @IsOptional()
  @IsEnum(['plante', 'transformation'])
  lot_type?: 'plante' | 'transformation'; // Type de lot (plante par défaut)
}