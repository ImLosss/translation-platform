export interface LlmResponse {
  status: boolean;
  message: string;
  totalTokens?: number;
  cost?: number;
}

export interface LlmProvider {
  generateTranslation(chatHistory: any[], isJsonFormat: boolean): Promise<LlmResponse>;
}