import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("nutriments")
export class Nutriments {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nom: string;

  @Column()
  marque: string;

  @Column({ type: 'enum', enum: ['minerale', 'organique', 'chimique'], default: 'organique' })
  type: string;

  @Column( { type: 'text', nullable: true })
  description: string;

  @Column()
  isPublic: boolean;

}