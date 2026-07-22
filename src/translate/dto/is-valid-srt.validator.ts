// src/translate/dto/is-srt.validator.ts
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  ValidationOptions,
  registerDecorator,
} from 'class-validator';
import { BadRequestException } from '@nestjs/common';

// Pindahkan interface ke sini agar mudah diakses
export interface SrtBlock {
  line: number;
  timestamp: string;
  content: string;
}

@ValidatorConstraint({ name: 'isSrtFormat', async: false })
export class IsSrtConstraint implements ValidatorConstraintInterface {
  private customErrorMessage = 'Format SRT tidak valid';

  validate(content: string, args: ValidationArguments) {
    if (typeof content !== 'string' || content.trim() === '') {
      this.customErrorMessage = 'srtContent tidak boleh kosong dan harus berupa teks.';
      return false;
    }

    try {
      // Kita jalankan fungsi parse Anda untuk menguji formatnya
      this.parseSrt(content);
      return true; // Jika tembus tanpa error, berarti valid
    } catch (error) {
      // Tangkap pesan error spesifik dari fungsi parseSrt (misal: "Terdapat kesalahan format urutan...")
      this.customErrorMessage = error.message;
      return false; 
    }
  }

  // Pesan ini akan otomatis dikirim ke client jika validate() me-return false
  defaultMessage(args: ValidationArguments) {
    return this.customErrorMessage;
  }

  
  private parseSrt(content: string): SrtBlock[] {
    const srtArr = content.split('\n');
    let currentLine = 1;
    const srtList: SrtBlock[] = [];
    let lastState = '';

    let srtJson: Partial<SrtBlock> = {};
    let contentLines: string[] = [];

    for (let item of srtArr) {
      item = item.trim();

      if (item === '') {
        if (lastState === 'content_multiline' && contentLines.length > 0) {
          srtJson.content = contentLines.join('\n');
          srtList.push(srtJson as SrtBlock);

          srtJson = {};
          contentLines = [];
          lastState = '';
          currentLine += 1;
        }
        continue;
      }

      if (lastState === '') {
        if (!isNaN(Number(item)) && Number.isInteger(Number(item))) {
          srtJson.line = Number(item);
          lastState = 'line';
        } else {
          throw new BadRequestException(`Terdapat kesalahan format urutan pada SRT di baris ke-${currentLine}`);
        }
      } else if (lastState === 'line') {
        if (!this.isSrtTimestamp(item)) {
          throw new BadRequestException(`Terdapat kesalahan pada format timestamp SRT di baris ke-${currentLine}`);
        }
        srtJson.timestamp = item;
        lastState = 'timestamp';
      } else if (lastState === 'timestamp' || lastState === 'content_multiline') {
        contentLines.push(item);
        lastState = 'content_multiline';
      }
    }

    if (lastState === 'content_multiline' && contentLines.length > 0) {
      srtJson.content = contentLines.join('\n');
      srtList.push(srtJson as SrtBlock);
    }

    return srtList;
  }

  private isSrtTimestamp(timestamp: string): boolean {
    const srtRegex = /^\d{2}:\d{2}:\d{2},\d{3} --> \d{2}:\d{2}:\d{2},\d{3}$/;
    return srtRegex.test(timestamp);
  }
}

// Export decorator agar bisa dipakai di DTO
export function IsValidSrt(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsSrtConstraint,
    });
  };
}