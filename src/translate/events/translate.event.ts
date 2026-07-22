import { TranslateDto } from '../dto/translate.dto';
import { SrtBlock } from '../translate.service';

export class TranslationProcessEvent {
  translationId: number;
  dto: TranslateDto;
  translationRows: any; 
}