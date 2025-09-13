import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn, JoinColumn
} from "typeorm";
import { EnvironnementLot } from './entitie.environement-lot';
import { Variete } from "./entitie.variete";
import { User } from "./entitie.user";
import { LotAction } from "./entitie.lots-action";

@Entity("lots")
export class Lot {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nom: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'date' })
  dateDebut: Date;

  @Column({ type: 'date', nullable: true })
  dateFin: Date;

  @Column()
  planteQuantite: number;

  @Column({type: 'enum', enum: ['Croissance', 'Floraison', 'Sechage', 'Curring', 'Stockage'], default: 'Croissance'})
  etapeCulture: string;

  @Column({nullable: true})
  quantite: number;

  @ManyToOne(() => Variete, (variete) => variete.lots, { eager: true })
  variete: Variete;

  @JoinColumn()
  @OneToMany(() => EnvironnementLot, (envLot) => envLot.lot)
  environnements_lots: EnvironnementLot[];

  @ManyToOne(() => User, (user) => user.lots)
  user: User;

  @Column()
  userId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => LotAction, action => action.lot)
  actions: LotAction[];
}
