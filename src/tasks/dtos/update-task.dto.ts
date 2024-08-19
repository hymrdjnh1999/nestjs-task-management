import { IsNotEmpty } from "class-validator";

export class UpdateTaskDto {
  @IsNotEmpty()
  id: string;
  @IsNotEmpty()
  title: string;
  @IsNotEmpty()
  description: string;
}
