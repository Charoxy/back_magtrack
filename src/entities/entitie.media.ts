import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm";
import { Lot } from "./entitie.lots";

@Entity('medias')
export class Media {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: ['photo', 'analyse'] })
  type: string;

  @Column({ type: 'varchar', length: 255 })
  nom: string;

  @Column({ type: 'longblob' })
  data: Buffer;

  @Column({ type: 'varchar', length: 100 })
  mimeType: string;

  @Column({ type: 'int' })
  taille: number; // Taille en bytes

  @ManyToOne(() => Lot, lot => lot.medias, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lotId' })
  lot: Lot;

  @Column()
  lotId: number;

  @CreateDateColumn({ type: 'timestamp' })
  dateCreation: Date;

  @Column({ type: 'text', nullable: true })
  description: string;
}
