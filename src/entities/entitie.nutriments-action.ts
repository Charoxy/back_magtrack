import { LotAction } from "./entitie.lots-action";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Nutriments } from "./entitie.nutriments";

@Entity('nutriments_actions')
export class  NutrimentAction {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'float' })
  mlParLitre: number;

  @ManyToOne(() => Nutriments, { eager: true })
  nutriment: number;

  @ManyToOne(() => LotAction, (action) => action.engraisUtilises, { onDelete: 'CASCADE' })
  action: LotAction;

}
