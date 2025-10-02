import { IsNumber, IsString, IsOptional, IsEnum, Min } from "class-validator";

export class UpdateStockDto {
  @IsNumber()
  @Min(0)
  newStock: number;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsEnum(['sale', 'loss', 'adjustment', 'transformation'])
  movementType: 'sale' | 'loss' | 'adjustment' | 'transformation';
}