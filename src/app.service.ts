import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager } from '@google/generative-ai/server';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as fs from 'node:fs/promises';
import { PostImageDTO } from './DTOs/PostImageDTO';
import { Measure } from './entities/measure.entity';
import AppDataSource from './dataSource';
import { Like } from 'typeorm';
import { PatchConfirmDTO } from './DTOs/PatchConfirmDTO';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

const waterPrompt =
  'Read the water meter on the image bellow and provide the reading in cubic meters. Do not hallucinate. Only return the value and nothing more';
const gasPrompt =
  'Read the gas meter on the image bellow and provide the reading in cubic meters. Do not hallucinate. Only return the value and nothing more';

@Injectable()
export class AppService {
  async postImage(postImageDTO: PostImageDTO) {
    const { image, customer_code, measure_datetime, measure_type } =
      postImageDTO;

    const yearMonth = measure_datetime.slice(0, 7);

    const measure = await AppDataSource.getRepository(Measure).findOne({
      where: {
        customer_code,
        datetime: Like(`${yearMonth}%`),
        type: measure_type,
      },
    });

    if (measure) {
      throw new ConflictException('Leitura do mês já realizada');
    }

    const imageBuffer = Buffer.from(image, 'base64');
    const imagePath = `${customer_code}-${measure_datetime}.jpg`;
    await fs.writeFile(imagePath, imageBuffer);

    const uploadResponse = await fileManager.uploadFile(imagePath, {
      mimeType: 'image/jpeg',
    });

    const prompt = measure_type === 'WATER' ? waterPrompt : gasPrompt;

    const generatedContent = await model.generateContent([
      {
        fileData: {
          mimeType: uploadResponse.file.mimeType,
          fileUri: uploadResponse.file.uri,
        },
      },
      {
        text: prompt,
      },
    ]);

    const newMeasure = new Measure();
    newMeasure.datetime = measure_datetime;
    newMeasure.type = measure_type;
    newMeasure.has_confirmed = false;
    newMeasure.image_url = uploadResponse.file.uri;
    newMeasure.customer_code = customer_code;
    newMeasure.measured_value = parseFloat(generatedContent.response.text());

    const newRow = await AppDataSource.getRepository(Measure).save(newMeasure);

    return {
      link: uploadResponse.file.uri,
      guid: newRow.id,
      leitura: generatedContent.response.text(),
    };
  }

  async getMeasures(customerCode: string, measureType?: string) {
    const measures = await AppDataSource.getRepository(Measure).find({
      where: { customer_code: customerCode, type: measureType },
    });

    if (measures.length === 0) {
      throw new NotFoundException('Nenhuma leitura encontrada');
    }

    return {
      customer_code: customerCode,
      measures: measures.map((measure) => ({
        measure_uuid: measure.id,
        measure_datetime: measure.datetime,
        measure_type: measure.type,
        has_confirmed: measure.has_confirmed,
        image_url: measure.image_url,
      })),
    };
  }
  async patchConfirm(patchConfirmDTO: PatchConfirmDTO) {
    const { measure_uuid, confirmed_value } = patchConfirmDTO;

    const measure = await AppDataSource.getRepository(Measure).findOne({
      where: { id: measure_uuid },
    });

    if (!measure) {
      throw new NotFoundException('Leitura não encontrada');
    }

    measure.measured_value = confirmed_value;
    measure.has_confirmed = true;

    await AppDataSource.getRepository(Measure).save(measure);

    return {
      success: true,
    };
  }
}
