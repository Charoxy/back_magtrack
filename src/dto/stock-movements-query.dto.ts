import { IsOptional, IsString, IsInt, Min, IsEnum } from "class-validator";
import { Type, Transform } from "class-transformer";

export class StockMovementsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  days?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  lotId?: number;

  @IsOptional()
  @IsEnum(['plante', 'trim', 'transformation'])
  lotType?: 'plante' | 'trim' | 'transformation';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  transformationId?: number;
}