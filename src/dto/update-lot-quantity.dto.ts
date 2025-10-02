import { IsNumber, IsPositive } from "class-validator";

export class UpdateLotQuantityDto {
  @IsNumber()
  @IsPositive()
  quantite: number;
}