import { IsString, IsNumber, IsBoolean, IsDateString, IsOptional, Min, Max, IsIn } from 'class-validator';

export class EnvMake {
  @IsString()
  nom: string;

  @IsString()
  @IsIn(['culture', 'séchage', 'stockage', 'destruction', 'autre']) // adapter selon les types possibles
  type: string;

  @IsString()
  @IsIn(['indoor', 'outdoor'])
  culture_type: string;

  @IsString()
  localisation: string;

  @IsNumber()
  @Min(0)
  surface_m2: number;

  @IsNumber()
  @Min(0)
  capacite_max_plants: number;

  @IsNumber()
  temp_cible_min: number;

  @IsNumber()
  temp_cible_max: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  humidite_cible_min: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  humidite_cible_max: number;

  @IsNumber()
  @Min(0)
  co2_cible_ppm: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  lumiere_watt: number;

  @IsOptional()
  @IsNumber()
  nombre_ventilateurs: number;

  @IsNumber()
  @Min(0)
  photoperiode_jour: number;

  @IsNumber()
  @Min(0)
  photoperiode_nuit: number;

  @IsBoolean()
  alertes_activees: boolean;

  @IsString()
  @IsIn(['actif', 'inactif'])
  statut: string;

  @IsOptional()
  @IsString()
  commentaires?: string;
}
