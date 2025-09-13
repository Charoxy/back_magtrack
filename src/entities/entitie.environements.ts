import { ConditionEnvironnementale } from "./entitie.condition-environnementale";
import { EnvironnementLot } from "./entitie.environement-lot";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./entitie.user";
import { Lot } from "./entitie.lots";

@Entity('environnements')
export class Environnement {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nom: string;

  @Column({ type: 'enum', enum: ['culture', 'séchage', 'stockage', 'destruction', 'autre'] })
  type: string;

  @Column({type: 'enum', enum: ['indoor', 'outdoor']})
  culture_type: string;

  @Column({ nullable: true })
  localisation: string;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  surface_m2: number;

  @Column({ type: 'int', nullable: true })
  capacite_max_plants: number;

  @Column({ type: 'decimal', precision: 4, scale: 1, nullable: true })
  temp_cible_min: number;

  @Column({ type: 'decimal', precision: 4, scale: 1, nullable: true })
  temp_cible_max: number;

  @Column({ type: 'decimal', precision: 4, scale: 1, nullable: true })
  humidite_cible_min: number;

  @Column({ type: 'decimal', precision: 4, scale: 1, nullable: true })
  humidite_cible_max: number;

  @Column({ type: 'int', nullable: true })
  co2_cible_ppm: number;

  @Column({ type: 'int', nullable: true })
  lumiere_watt: number;

  @Column({ type: 'tinyint', nullable: true })
  nombre_ventilateurs: number;

  @Column({ type: 'tinyint', nullable: true })
  photoperiode_jour: number;

  @Column({ type: 'tinyint', nullable: true })
  photoperiode_nuit: number;

  @Column({ default: false })
  alertes_activees: boolean;

  @Column({ type: 'enum', enum: ['actif', 'en maintenance', 'fermé'], default: 'actif' })
  statut: string;

  @Column({ type: 'text', nullable: true })
  commentaires: string;

  @OneToMany(() => ConditionEnvironnementale, cond => cond.environnement)
  conditions: ConditionEnvironnementale[];

  @OneToMany(() => EnvironnementLot, el => el.environnement)
  lots_associes: EnvironnementLot[];

  @OneToMany(() => Lot, (lot) => lot.user)
  lots: Lot[];

  @ManyToOne(() => User, user => user.environnements)
  user: User;

  @Column()
  userId: number;


}
