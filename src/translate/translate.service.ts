import { Injectable } from '@nestjs/common';

@Injectable()
export class TranslateService {
    async translate(body: any) {
        console.log(body);
        return {
            text: 'Translated text',
        };
    }
}
