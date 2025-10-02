import { IsString, IsEnum, IsOptional, IsNumber, IsBoolean, IsArray, ValidateNested, Min, Max } from "class-validator";
import { Type } from "class-transformer";

export class TransformationSourceDto {
  @IsNumber()
  @Min(1)
  lot_source_id: number;

  @IsEnum(['plante', 'trim'])
  lot_source_type: 'plante' | 'trim';

  @IsNumber()
  @Min(0)
  quantite_utilisee: number;
}

export class CreateTransformationLotDto {
  @IsString()
  nom: string;

  @IsEnum(['huile', 'hash', 'rosin', 'trim', 'autre'])
  type_transformation: 'huile' | 'hash' | 'rosin' | 'trim' | 'autre';

  @IsOptional()
  @IsEnum(['charas', 'bubble_hash', 'dry_sift', 'fresh_frozen'])
  hash_method?: 'charas' | 'bubble_hash' | 'dry_sift' | 'fresh_frozen';

  @IsOptional()
  @IsString()
  type_transformation_autre?: string;

  @IsNumber()
  @Min(0.01)
  quantite_obtenue: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  rendement?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  tauxTHC: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  tauxCBD: number;

  @IsBoolean()
  perte_stock: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  quantite_perdue?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  methode_extraction?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TransformationSourceDto)
  sources: TransformationSourceDto[];
}