import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { LlmProvider, LlmResponse } from '../interfaces/llm-provider.interface';

@Injectable()
export class GptLunaService implements LlmProvider {
  private readonly logger = new Logger(GptLunaService.name);
  // Menggunakan standar endpoint OpenAI
  private readonly apiUrl = 'https://api.openai.com/v1/chat/completions';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async generateTranslation(chatHistory: any[], isJsonFormat: boolean): Promise<LlmResponse> {
    const available = await this.isAvailable();
    if (!available) {
      this.logger.error('GPT-5.6 Luna API tidak tersedia atau API Key tidak valid.');
      throw new Error('GPT-5.6 Luna API tidak tersedia atau API Key tidak valid.');
    }

    const apiKey = this.configService.get<string>('LUNA_APIKEY');
    
    if (!apiKey) {
      this.logger.error('LUNA_APIKEY tidak ditemukan di environment variables!');
      return { status: false, message: 'Konfigurasi API Key Luna tidak valid.' };
    }

    const headers = {
      'Accept': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    };

    // Payload disesuaikan untuk standar OpenAI (hilangkan parameter spesifik DeepSeek seperti 'thinking')
    const payload = {
      messages: chatHistory,
      model: 'gpt-5.6-luna', 
      frequency_penalty: 0,
      max_tokens: 8192,
      presence_penalty: 0,
      response_format: { type: isJsonFormat ? 'json_object' : 'text' },
      stop: null,
      stream: false,
      temperature: isJsonFormat ? 0.8 : 1,
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(this.apiUrl, payload, { headers })
      );

      const responseData = response.data;

      if (!responseData || !responseData.choices || responseData.choices.length === 0) {
        return { status: false, message: 'Response dari API Luna kosong atau tidak valid.' };
      }

      const responseMessage = responseData.choices[0].message.content;
      
      const usage = responseData.usage || {};
      const promptTokens = usage.prompt_tokens || 0;
      const completionTokens = usage.completion_tokens || 0;
      const totalTokens = usage.total_tokens || 0;

      return {
        status: true,
        message: responseMessage,
        inputTokens: promptTokens,
        outputTokens: completionTokens,
        totalTokens: totalTokens,
      };

    } catch (error: any) {
      this.logger.error(`Request GPT-5.6 Luna gagal: ${error.message}`, error.stack);
      await new Promise((resolve) => setTimeout(resolve, 500));

      return {
        status: false,
        message: error.response?.data?.error?.message || error.message || 'Terjadi kesalahan saat menghubungi API Luna.',
      };
    }
  }

  async isAvailable(): Promise<boolean> {
    const apiKey = this.configService.get<string>('LUNA_APIKEY');
    if (!apiKey) {
      this.logger.warn('LUNA_APIKEY tidak ditemukan di environment variables!');
      return false;
    }

    try {
      const headers = {
        'Authorization': `Bearer ${apiKey}`,
      };

      // OpenAI tidak memiliki endpoint /user/balance, pendekatan terbaik adalah mengecek list models
      await firstValueFrom(
        this.httpService.get('https://api.openai.com/v1/models', { headers })
      );

      return true;
    } catch (error: any) {
      this.logger.error(`Failed to check Luna availability: ${error.message}`, error.stack);
      return false;
    }
  }
}