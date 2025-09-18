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
import { Lot } from "./entitie.lots";

@Entity("share_lots")
export class ShareLots {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @JoinColumn()
    @OneToOne(() => Lot , lot => lot.shareLots)
    lot: Lot;

    @Column()
    lotId: number;

    @CreateDateColumn()
    createdAt: Date;
}
