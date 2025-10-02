import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  BeforeInsert
} from "typeorm";
import { User } from './entitie.user';
import { LotTransformationSource } from './entitie.lots-transformation-sources';

@Entity('lots_transformation')
export class LotTransformation {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  nom: string;

  @Column({
    type: 'enum',
    enum: ['huile', 'hash', 'rosin', 'trim', 'autre']
  })
  type_transformation: string;

  @Column({
    type: 'enum',
    enum: ['charas', 'bubble_hash', 'dry_sift', 'fresh_frozen'],
    nullable: true
  })
  hash_method: string;

  @Column({ length: 255, nullable: true })
  type_transformation_autre: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantite_obtenue: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  stock: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  rendement: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  tauxTHC: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  tauxCBD: number;

  @Column({ type: 'boolean', default: false })
  perte_stock: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  quantite_perdue: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'text', nullable: true })
  methode_extraction: string;

  @Column({ type: 'boolean', default: false })
  is_public: boolean;

  @Column({ length: 36, unique: true, nullable: true })
  uuid: string;

  @Column()
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => LotTransformationSource, source => source.lotTransformation)
  sources: LotTransformationSource[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  generateUuid() {
    if (!this.uuid) {
      this.uuid = require('crypto').randomUUID();
    }
  }
}