import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  JoinColumn
} from "typeorm";
import { Variete } from "./entitie.variete";
import { Environnement } from "./entitie.environements";
import { User } from "./entitie.user";
import { Lot } from "./entitie.lots";

@Entity("pieds_meres")
export class PiedMere {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  nom: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  @Column({ nullable: true })
  lotId: number;

  @ManyToOne(() => Lot, { nullable: true })
  @JoinColumn({ name: 'lotId' })
  lot: Lot;

  @ManyToOne(() => Variete, { eager: true })
  @JoinColumn({ name: 'varieteId' })
  variete: Variete;

  @Column()
  varieteId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  // Origine du pied mère (traçabilité)
  @Column()
  lotOrigineId: number; // Le lot de clones test

  @Column()
  plantIndex: number; // Quel clone du lot de clones test (1-16)

  @Column()
  lotGrainesId: number; // Le lot de graines d'origine

  @Column()
  plantGrainesIndex: number; // Quel plant du lot de graines (1-16)

  // Dates et statut
  @CreateDateColumn({ type: 'timestamp' })
  dateCreation: Date;

  @Column({ type: 'timestamp', nullable: true })
  dateRetrait: Date;

  @Column({ type: 'enum', enum: ['actif', 'repos', 'retiré'], default: 'actif' })
  statut: string;

  @Column({ type: 'int', default: 1 })
  generation: number;

  // Localisation
  @ManyToOne(() => Environnement, { eager: true })
  @JoinColumn({ name: 'environnementId' })
  environnement: Environnement;

  @Column()
  environnementId: number;

  // Infos qualité (copiées depuis l'évaluation)
  @Column({ type: 'decimal', precision: 3, scale: 1, nullable: true })
  noteGlobale: number;

  @Column({ type: 'decimal', precision: 3, scale: 1, nullable: true })
  notePuissance: number;

  @Column({ type: 'decimal', precision: 3, scale: 1, nullable: true })
  noteGout: number;

  @Column({ type: 'decimal', precision: 3, scale: 1, nullable: true })
  noteRendement: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  poidsRecolte: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  tauxTHC: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  tauxCBD: number;

  // Notes et description
  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  caracteristiques: string;

  // Stats d'utilisation
  @Column({ type: 'int', default: 0 })
  nombreClonesPrelevés: number;

  @Column({ type: 'timestamp', nullable: true })
  dernierPrelevement: Date;

  // Relations
  @OneToMany(() => Lot, lot => lot.piedMere)
  lotsCreés: Lot[];
}
