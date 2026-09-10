import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { LlmProvider, LlmResponse } from '../interfaces/llm-provider.interface'; // Sesuaikan path

@Injectable()
export class NineInferenceService implements LlmProvider {
  private readonly logger = new Logger(NineInferenceService.name);
  // private readonly apiUrl = 'https://9inference.cloud/v1/package/chat/completions';
  private readonly apiUrl = 'https://9inference.cloud/v1/chat/completions';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async generateTranslation(chatHistory: any[], isJsonFormat: boolean): Promise<LlmResponse> {
    const available = await this.isAvailable();
    if (!available) {
      this.logger.error('9inference API tidak tersedia atau API Key tidak valid.');
      throw new Error('9inference API tidak tersedia atau API Key tidak valid.');
    }

    const apiKey = this.configService.get<string>('NINE_INFERENCE_APIKEY');
    
    if (!apiKey) {
      this.logger.error('NINE_INFERENCE_APIKEY tidak ditemukan di environment variables!');
      return { status: false, message: 'Konfigurasi API Key 9inference tidak valid.' };
    }

    const headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    };

    // Ambil model dari env atau gunakan default
    const modelName = this.configService.get<string>('NINE_INFERENCE_MODEL') || 'deepseek-v4-pro-0813';

    const payload: any = {
      model: modelName,
      messages: chatHistory,
      temperature: isJsonFormat ? 0.8 : 1,
    };

    if (isJsonFormat) {
      payload.response_format = { type: 'json_object' };
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post(this.apiUrl, payload, { headers })
      );

      const responseData = response.data;

      if (!responseData || !responseData.choices || responseData.choices.length === 0) {
        return { status: false, message: 'Response dari API 9inference kosong atau tidak valid.' };
      }

      const messageObj = responseData.choices[0].message;
      const usage = responseData.usage || {};
      
      const cachedTokens = usage.prompt_tokens_details?.cached_tokens || 0;
      const promptTokens = usage.prompt_tokens || 0;
      const completionTokens = usage.completion_tokens || 0;
      const missedTokens = promptTokens - cachedTokens;

      const remainingTokens = responseData.x_package_usage?.remainingTokens || 'N/A';
      
      // Catat info tambahan (Reasoning & Biaya) di log server
      this.logger.debug(`Remaining Pkg Tokens: ${remainingTokens}`);
      if (messageObj.reasoning_content) {
         this.logger.debug(`Reasoning: ${messageObj.reasoning_content}`);
      }

      // Kembalikan strict format sesuai LlmResponse
      return {
        status: true,
        message: messageObj.content,
        inputTokens: missedTokens,
        inputCacheTokens: cachedTokens,
        outputTokens: completionTokens,
        totalTokens: usage.total_tokens || 0,
      };

    } catch (error: any) {
      const errorMessage = error.response?.data ? JSON.stringify(error.response.data) : error.message;
      this.logger.error(`Request 9inference gagal: ${errorMessage}`, error.stack);

      await new Promise((resolve) => setTimeout(resolve, 500));

      return {
        status: false,
        message: errorMessage || 'Terjadi kesalahan saat menghubungi API 9inference.',
      };
    }
  }

  async isAvailable(): Promise<boolean> {
    const apiKey = this.configService.get<string>('NINE_INFERENCE_APIKEY');
    if (!apiKey) {
      this.logger.warn('NINE_INFERENCE_APIKEY tidak ditemukan di environment variables!');
      return false;
    }
    return true; 
  }
}