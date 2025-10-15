import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Environnement } from "./entitie.environements";
import { Lot } from "./entitie.lots";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  nom: string;

  @Column({ nullable: true })
  organisation: string;

  @Column({ default: 'producteur, non_producteur' }) // ex: producteur, admin, technicien
  role: string;

  @Column({ type: 'boolean', default: false })
  onboardingCompleted: boolean;

  @OneToMany(() => Lot, (lot) => lot.user)
  lots: Lot[];

  @OneToMany(() => Environnement, (env) => env.user)
  environnements: Environnement[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
