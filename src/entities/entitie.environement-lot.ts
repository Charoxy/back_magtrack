// environnement-lot.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Environnement } from "./entitie.environements";
import { Lot } from "./entitie.lots";

@Entity('environnements_lots')
export class EnvironnementLot {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Lot, lot => lot.environnements_lots, { onDelete: 'CASCADE' })
  lot: Lot;

  @Column()
  lotId: number;

  @ManyToOne(() => Environnement, env => env.lots_associes, { onDelete: 'CASCADE' })
  environnement: Environnement;

  @Column()
  environnementId: number

  @Column({ type: 'enum', enum: ['culture', 'séchage', 'maturation', 'autre'] })
  etape: string;

  @Column({ type: 'date' })
  date_entree: Date;

  @Column({ type: 'date', nullable: true })
  date_sortie: Date;

  @Column({ type: 'text', nullable: true })
  commentaire: string;
}
