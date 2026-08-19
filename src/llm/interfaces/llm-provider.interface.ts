export interface LlmResponse {
  status: boolean;
  message: string;
  inputTokens?: number;
  inputCacheTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
}

export interface LlmProvider {
  generateTranslation(chatHistory: any[], isJsonFormat: boolean): Promise<LlmResponse>;
  isAvailable(): Promise<boolean>;
}