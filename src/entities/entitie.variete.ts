import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Lot } from "./entitie.lots";


@Entity("varietes")
export class Variete {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nom: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  origine: string; // ex: Canada, Pays-Bas…

  @Column({ nullable: true })
  breeder: string; // ex: HokuSeed, High alpine gentics...

  @Column({ nullable: true })
  type: string; // ex: Indica, Sativa, Hybride

  @Column({ type: 'float', nullable: true })
  tauxTHC: number;

  @Column({ type: 'float', nullable: true })
  tauxCBD: number;

  @OneToMany(() => Lot, (lot) => lot.variete)
  lots: Lot[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
