import { IsNotEmpty, IsNumberString } from 'class-validator';

export class GetMeasuresDTO {
  @IsNotEmpty()
  @IsNumberString()
  customer_code: string;
}
