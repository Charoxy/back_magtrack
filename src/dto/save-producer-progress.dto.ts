import { IsArray, IsString } from "class-validator";

export class SaveProducerProgressDto {
  @IsArray()
  @IsString({ each: true })
  completedTasks: string[];

  @IsArray()
  @IsString({ each: true })
  completedSubtasks: string[];
}