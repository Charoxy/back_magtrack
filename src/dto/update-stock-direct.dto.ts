import { IsNumber, IsString, IsOptional, Min } from "class-validator";

export class UpdateStockDirectDto {
  @IsNumber()
  @Min(0)
  stock: number;

  @IsOptional()
  @IsString()
  reason?: string;
}