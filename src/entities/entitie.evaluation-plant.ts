import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn
} from "typeorm";
import { Lot } from "./entitie.lots";
import { PiedMere } from "./entitie.pied-mere";
import { User } from "./entitie.user";

@Entity("evaluations_plants")
export class EvaluationPlant {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Lot, lot => lot.evaluations)
  @JoinColumn({ name: 'lotId' })
  lot: Lot;

  @Column()
  lotId: number;

  @Column({ type: 'int' })
  plantIndex: number; // 1 à N (nombre de plants du lot)

  @Column({ type: 'varchar', length: 100, nullable: true })
  marqueur: string; // "A", "B", "Plant #5", "★"

  // Notes de qualité (0-10)
  @Column({ type: 'decimal', precision: 3, scale: 1 })
  noteGlobale: number; // REQUIRED

  @Column({ type: 'decimal', precision: 3, scale: 1, nullable: true })
  notePuissance: number;

  @Column({ type: 'decimal', precision: 3, scale: 1, nullable: true })
  noteGout: number;

  @Column({ type: 'decimal', precision: 3, scale: 1, nullable: true })
  noteRendement: number;

  // Résultats de labo
  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  poidsRecolte: number; // en grammes

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  tauxTHC: number; // pourcentage

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  tauxCBD: number; // pourcentage

  // Décision
  @Column({ type: 'boolean', default: false })
  selectionne: boolean; // Transformé en pied mère ?

  @ManyToOne(() => PiedMere, { nullable: true })
  @JoinColumn({ name: 'piedMereId' })
  piedMere: PiedMere;

  @Column({ nullable: true })
  piedMereId: number;

  // Notes textuelles
  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ type: 'timestamp' })
  dateEvaluation: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;
}
