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
import { PiedMere } from "./entitie.pied-mere";
import { EvaluationPlant } from "./entitie.evaluation-plant";

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

  @Column({ type: 'enum', enum: ['terre', 'hydroponie', 'living soil', 'coco'], nullable: true })
  substrat: string;

  // Origine du lot et traçabilité
  @Column({ type: 'enum', enum: ['graine', 'clone_test', 'clone_production', 'pied_mere'], default: 'graine' })
  origine: string;

  // Si origine = 'clone_production'
  @Column({ nullable: true })
  piedMereId: number;

  // Si origine = 'clone_test'
  @Column({ nullable: true })
  lotParentGrainesId: number;

  @Column({ type: 'boolean', default: false })
  enAttenteSelection: boolean;

  // Si origine = 'graine'
  @Column({ nullable: true })
  lotClonesTestId: number;

  @Column({ type: 'boolean', default: false })
  clonesTestCrees: boolean;

  // Génération de clonage (0 = graine, 1 = clone, 2 = clone de clone...)
  @Column({ type: 'int', default: 0 })
  generation: number;

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

  @OneToMany('Media', 'lot')
  medias: any[];

  @ManyToOne(() => PiedMere, (piedMere) => piedMere.lotsCreés, { nullable: true })
  @JoinColumn({ name: 'piedMereId' })
  piedMere: PiedMere;

  @OneToMany(() => EvaluationPlant, (evaluation) => evaluation.lot)
  evaluations: EvaluationPlant[];
}
