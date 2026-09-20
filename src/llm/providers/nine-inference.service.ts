import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { LlmProvider, LlmResponse } from '../interfaces/llm-provider.interface'; // Sesuaikan path

@Injectable()
export class NineInferenceService implements LlmProvider {
  private readonly logger = new Logger(NineInferenceService.name);
  private readonly apiUrl = 'https://9inference.cloud/v1/chat/completions';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async generateTranslation(chatHistory: any[], isJsonFormat: boolean, model?: string): Promise<LlmResponse> {
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

    const modelName = model || this.configService.get<string>('NINE_INFERENCE_MODEL') || 'deepseek-v4-pro-0813';

    const payload: any = {
      model: modelName,
      messages: chatHistory,
      temperature: isJsonFormat ? 0.8 : 1,
      stream: true, // WAJIB TRUE untuk mencegah timeout
      stream_options: {
        include_usage: true, // WAJIB TRUE agar token usage dikirim di akhir stream
      }
    };

    if (isJsonFormat) {
      payload.response_format = { type: 'json_object' };
    }

    try {
      // Gunakan axiosRef dengan responseType: 'stream'
      const response = await this.httpService.axiosRef.post(this.apiUrl, payload, {
        headers,
        responseType: 'stream',
      });

      // Bungkus stream dalam Promise agar tetap mengembalikan format LlmResponse di akhir
      return new Promise((resolve) => {
        const stream = response.data;
        let fullMessage = '';
        let fullReasoning = '';
        let usageData: any = null;
        let buffer = '';

        stream.on('data', (chunk: Buffer) => {
          buffer += chunk.toString('utf8');
          const lines = buffer.split('\n');
          
          // Simpan sisa string yang terpotong ke buffer untuk iterasi selanjutnya
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine || !trimmedLine.startsWith('data: ')) continue;

            const dataString = trimmedLine.replace(/^data: /, '');
            
            if (dataString === '[DONE]') continue;

            try {
              const parsed = JSON.parse(dataString);
              
              // 1. Akumulasi pesan teks
              const delta = parsed.choices?.[0]?.delta;
              if (delta?.content) {
                this.logger.debug(`Delta content diterima: ${delta.content}`);
                fullMessage += delta.content;
              }
              if (delta?.reasoning_content) {
                this.logger.debug(`Delta reasoning diterima: ${delta.reasoning_content}`);
                fullReasoning += delta.reasoning_content;
              }

              // 2. Tangkap usage token (biasanya dikirim di chunk paling akhir)
              if (parsed.usage) {
                this.logger.debug(`Usage data diterima: ${JSON.stringify(parsed.usage)}`);
                usageData = parsed.usage;
              }
            } catch (err) {
              // Abaikan error parse JSON pada chunk yang tidak lengkap
            }
          }
        });

        // Ketika stream selesai sepenuhnya
        stream.on('end', () => {
          if (fullReasoning) {
            this.logger.debug(`Reasoning: ${fullReasoning}`);
          }

          const cachedTokens = usageData?.prompt_tokens_details?.cached_tokens || 0;
          const promptTokens = usageData?.prompt_tokens || 0;
          const completionTokens = usageData?.completion_tokens || 0;
          const missedTokens = Math.max(0, promptTokens - cachedTokens);

          // Kembalikan format persis seperti aslinya
          resolve({
            status: true,
            message: fullMessage,
            inputTokens: missedTokens,
            inputCacheTokens: cachedTokens,
            outputTokens: completionTokens,
            totalTokens: usageData?.total_tokens || 0,
          });
        });

        stream.on('error', (err: any) => {
          this.logger.error(`Stream error dari 9inference: ${err.message}`);
          resolve({
            status: false,
            message: 'Terjadi kesalahan saat membaca stream dari 9inference.',
          });
        });
      });

    } catch (error: any) {
      const errorMessage = error.response?.data ? JSON.stringify(error.response.data) : error.message;
      this.logger.error(`Request 9inference gagal: ${errorMessage}`, error.stack);

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