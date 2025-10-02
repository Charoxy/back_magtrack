import { IsBoolean } from "class-validator";

export class ShareTransformationLotDto {
  @IsBoolean()
  is_public: boolean;
}