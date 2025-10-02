import { IsOptional, IsInt, Min, IsEnum } from "class-validator";
import { Type } from "class-transformer";

export class TransformationLotsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @IsOptional()
  @IsEnum(['huile', 'hash', 'rosin', 'trim', 'autre'])
  type?: 'huile' | 'hash' | 'rosin' | 'trim' | 'autre';
}