import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { LlmProvider, LlmResponse } from '../interfaces/llm-provider.interface'; // Sesuaikan path jika berbeda

@Injectable()
export class DeepseekService implements LlmProvider {
  private readonly logger = new Logger(DeepseekService.name);
  private readonly apiUrl = 'https://api.deepseek.com/chat/completions';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService, // Tambahkan ConfigService untuk akses .env
  ) {}

  async generateTranslation(chatHistory: any[], isJsonFormat: boolean): Promise<LlmResponse> {
    // 1. Ambil API Key dengan aman dari .env
    const apiKey = this.configService.get<string>('DEEPSEEK_APIKEY');
    
    if (!apiKey) {
      this.logger.error('DEEPSEEK_APIKEY tidak ditemukan di environment variables!');
      return { status: false, message: 'Konfigurasi API Key DeepSeek tidak valid.' };
    }

    // 2. Siapkan Headers
    const headers = {
      'Accept': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    };

    // 3. Siapkan Payload (Body Request)
    const payload = {
      messages: chatHistory,
      model: 'deepseek-v4-pro', 
      thinking: { type: 'disabled' },
      frequency_penalty: 0,
      max_tokens: 8192,
      presence_penalty: 0,
      response_format: { type: isJsonFormat ? 'json_object' : 'text' },
      stop: null,
      stream: false,
      temperature: isJsonFormat ? 0.8 : 1,
    };

    try {
      // 4. Eksekusi HTTP POST Request dan konversi Observable ke Promise
      const response = await firstValueFrom(
        this.httpService.post(this.apiUrl, payload, { headers })
      );

      const responseData = response.data;

      if (!responseData || !responseData.choices || responseData.choices.length === 0) {
        return { status: false, message: 'Response dari API DeepSeek kosong atau tidak valid.' };
      }

      const responseMessage = responseData.choices[0].message.content;
      
      // 5. Kalkulasi Token dan Biaya (Cost) sesuai dokumentasi DeepSeek
      const usage = responseData.usage || {};
      const promptCacheMissTokens = usage.prompt_cache_miss_tokens || 0;
      const promptCacheHitTokens = usage.prompt_cache_hit_tokens || 0;
      const completionTokens = usage.completion_tokens || 0;

      // Asumsi perhitungan dalam CNY
      const costInputMissCny = (promptCacheMissTokens / 1_000_000) * 2;
      const costInputHitCny = (promptCacheHitTokens / 1_000_000) * 0.5;
      const costOutputCny = (completionTokens / 1_000_000) * 8;

      // 6. Kembalikan data sesuai kontrak interface LlmResponse
      return {
        status: true,
        message: responseMessage,
        totalTokens: usage.total_tokens || 0,
        cost: costInputHitCny + costInputMissCny + costOutputCny,
      };

    } catch (error) {
      // 7. Tangani Error dengan rapi
      this.logger.error(`Request DeepSeek gagal: ${error.message}`, error.stack);

      // Delay pendek jika terjadi error agar tidak terkena rate-limit beruntun
      await new Promise((resolve) => setTimeout(resolve, 500));

      return {
        status: false,
        message: error.response?.data?.error?.message || error.message || 'Terjadi kesalahan saat menghubungi API DeepSeek.',
      };
    }
  }
}