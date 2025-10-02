import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn
} from "typeorm";
import { LotTransformation } from './entitie.lots-transformation';
import { Lot } from './entitie.lots';

@Entity('lots_transformation_sources')
export class LotTransformationSource {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  lotTransformationId: number;

  @Column()
  lotSourceId: number;

  @Column({
    type: 'enum',
    enum: ['plante', 'trim']
  })
  lot_source_type: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantite_utilisee: number;

  @ManyToOne(() => LotTransformation, transformation => transformation.sources, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lotTransformationId' })
  lotTransformation: LotTransformation;

  @ManyToOne(() => Lot)
  @JoinColumn({ name: 'lotSourceId' })
  lotSource: Lot;

  @CreateDateColumn()
  createdAt: Date;
}