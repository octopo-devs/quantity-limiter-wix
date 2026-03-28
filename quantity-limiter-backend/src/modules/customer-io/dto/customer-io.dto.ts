import { IsNotEmpty, IsString } from 'class-validator';

export class SendEventDto {
  @IsString()
  @IsNotEmpty()
  event: string;
  @IsString()
  @IsNotEmpty()
  shop: string;
}
