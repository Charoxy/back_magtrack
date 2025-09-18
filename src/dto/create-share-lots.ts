import { IsNumber } from "class-validator";

export class CreateShareLots {
  @IsNumber()
  lotId: number;
}
