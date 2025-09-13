import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn, OneToMany, JoinColumn
} from "typeorm";
import { User } from './entitie.user';
import { Lot } from "./entitie.lots";
import { NutrimentAction } from "./entitie.nutriments-action";

@Entity()
export class LotAction {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string; // ex: 'engrais', 'arrosage', 'taille', etc.

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'enum', enum: ['semi', 'croissance', 'floraison', 'maturation', 'sechage'], nullable: true })
  stage?: string;

  @Column({ type: 'float', nullable: true })
  quantity: number; // quantité d'eau ou d'engrais par exemple

  @Column({ nullable: true })
  unit: string; // L (litres), mL, g, etc.

  @Column({ type: 'date' })
  date: Date;

  @Column({nullable: true})
  OldEnv?: number;

  @Column({nullable: true})
  NewEnv?: number;

  @ManyToOne(() => Lot, lot => lot.actions, { onDelete: 'CASCADE' })
  lot: Lot;

  @Column({})
  lotId: number;

  @OneToMany(() => NutrimentAction, (eng) => eng.action, {
    cascade: true,
    eager: true,
  })
  @JoinColumn()
  engraisUtilises?: NutrimentAction[]; // le `?` rend la propriété optionnelle

}
