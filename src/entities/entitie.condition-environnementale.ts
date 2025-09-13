import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Environnement } from "./entitie.environements";

@Entity('conditions_environnementales')
export class ConditionEnvironnementale {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Environnement, env => env.conditions, { onDelete: 'CASCADE' })
  environnement: Environnement;

  @Column()
  environnementId: number;

  @Column({ type: 'datetime' })
  date_heure: Date;

  @Column({ type: 'decimal', precision: 4, scale: 1, nullable: true })
  temperature: number;

  @Column({ type: 'decimal', precision: 4, scale: 1, nullable: true })
  humidite: number;

  @Column({ type: 'int', nullable: true })
  co2: number;

  @Column({ type: 'int', nullable: true })
  lumiere: number;

  @Column({ type: 'enum', enum: ['manuel', 'capteur'], default: 'manuel' })
  source: string;

  @Column({ type: 'text', nullable: true })
  commentaire: string;
}
