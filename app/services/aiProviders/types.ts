// AI提供商接口定义
export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIResponse {
  content: string;
  model: string;
  provider: string;
}

export interface AIProvider {
  id: string;
  name: string;
  description: string;
  isFree: boolean;
  isAvailable: boolean;
  testConnection(): Promise<boolean>;
  generateResponse(messages: AIMessage[], options?: any): Promise<AIResponse>;
}

// AI服务配置
export interface AIServiceConfig {
  defaultProvider: string;
  providers: Record<string, {
    apiKey?: string;
    endpoint?: string;
    model?: string;
    options?: Record<string, any>;
  }>;
}

// 提供商ID常量
export const AI_PROVIDERS = {
  OPENAI: 'openai',
  HUGGINGFACE: 'huggingface',
  MOCK: 'mock',
  CLAUDE: 'claude',
  BAIDU: 'baidu',
  XUNFEI: 'xunfei',
  DEEPSEEK: 'deepseek'
}; 