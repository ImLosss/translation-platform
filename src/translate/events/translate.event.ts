import { TranslateDto } from '../dto/translate.dto';

export class TranslationProcessEvent {
  translationId: number;
  dto: TranslateDto;
}