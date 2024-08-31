import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (errors) => {
        return new BadRequestException({
          error_code: 'INVALID_DATA',
          error_message: errors.map((error) => {
            return {
              property: error.property,
              constraints: error.constraints,
            };
          }),
        });
      },
    }),
  );
  await app.listen(3000);
}
bootstrap();
