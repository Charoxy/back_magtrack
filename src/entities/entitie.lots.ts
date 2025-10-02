import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn, JoinColumn,
  OneToOne
} from "typeorm";
import { EnvironnementLot } from './entitie.environement-lot';
import { Variete } from "./entitie.variete";
import { User } from "./entitie.user";
import { LotAction } from "./entitie.lots-action";
import { ShareLots } from "./entitie.share-lots";

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

  @Column({type: 'enum', enum: ['Croissance', 'Floraison', 'Sechage', 'Maturation', 'Stockage',], default: 'Croissance'})
  etapeCulture: string;

  @Column({nullable: true})
  quantite: number;

  @Column({nullable: true, default: 0})
  stock: number;

  @Column({ type: 'varchar', length: 50, default: 'flower' })
  productType: string;

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

  @OneToOne(() => ShareLots, shareLots => shareLots.lot)
  shareLots: ShareLots;
}
