import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn
} from "typeorm";
import { Lot } from './entitie.lots';
import { LotTransformation } from './entitie.lots-transformation';

@Entity('stock_movements')
export class StockMovement {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  lotId: number;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: true
  })
  lot_type: string; // 'plante' | 'trim' | 'transformation'

  @Column({ type: 'varchar', length: 255, nullable: true })
  lot_nom: string;

  @Column({
    type: 'enum',
    enum: ['entree', 'sortie', 'sale', 'loss', 'adjustment', 'transformation'],
    default: 'adjustment'
  })
  movementType: string;

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  quantity: number;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({ type: 'int', nullable: true })
  transformation_id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  transformation_nom: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Lot, lot => lot.id, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'lotId' })
  lot: Lot;

  @ManyToOne(() => LotTransformation, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'transformation_id' })
  transformation: LotTransformation;
}