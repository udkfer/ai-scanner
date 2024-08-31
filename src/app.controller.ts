import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { AppService } from './app.service';
import { PostImageDTO } from './DTOs/PostImageDTO';
import { GetMeasuresDTO } from './DTOs/GetMeasuresDTO';
import { PatchConfirmDTO } from './DTOs/PatchConfirmDTO';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('/upload')
  uploadFile(@Body() postImageDTO: PostImageDTO) {
    return this.appService.postImage(postImageDTO);
  }

  @Patch('/confirm')
  confirmMeasure(@Body() patchConfirmDTO: PatchConfirmDTO) {
    return this.appService.patchConfirm(patchConfirmDTO);
  }

  @Get('/:customer_code/list')
  getMeasures(
    @Param() { customer_code }: GetMeasuresDTO,
    @Query('measure_type') measure_type: string,
  ) {
    return this.appService.getMeasures(customer_code, measure_type);
  }
}
