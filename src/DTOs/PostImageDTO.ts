import {
  IsBase64,
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsString
} from 'class-validator';

const measureTypes = ['WATER', 'GAS'];

export class PostImageDTO {
  @IsNotEmpty()
  @IsBase64()
  image: string;

  @IsNotEmpty()
  @IsString()
  customer_code: string;

  @IsNotEmpty()
  @IsDateString()
  measure_datetime: string;

  @IsNotEmpty()
  @IsIn(measureTypes)
  measure_type: string;
}
