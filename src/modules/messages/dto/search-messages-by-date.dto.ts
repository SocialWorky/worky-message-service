import { IsNotEmpty, IsString } from 'class-validator';

export class SearchMessagesByDateDto {
  @IsNotEmpty()
  @IsString()
  startDate: string;

  @IsNotEmpty()
  @IsString()
  endDate: string;
}
