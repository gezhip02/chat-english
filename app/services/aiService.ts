import { AI_PROVIDERS, AIMessage, AIProvider, AIResponse, AIServiceConfig } from './aiProviders/types';
import { OpenAIProvider } from './aiProviders/openAIProvider';
import { HuggingFaceProvider } from './aiProviders/huggingFaceProvider';
import { MockProvider } from './aiProviders/mockProvider';
import { ClaudeProvider } from './aiProviders/claudeProvider';
import { BaiduProvider } from './aiProviders/baiduProvider';
import { XunfeiProvider } from './aiProviders/xunfeiProvider';
import { DeepSeekProvider } from './aiProviders/deepSeekProvider';

export function createAIService(config: AIServiceConfig): AIService {
  const providers: Record<string, AIProvider> = {
    [AI_PROVIDERS.OPENAI]: new OpenAIProvider(
      config.providers[AI_PROVIDERS.OPENAI]?.apiKey || '',
      config.providers[AI_PROVIDERS.OPENAI]?.model || 'gpt-3.5-turbo'
    ),
    [AI_PROVIDERS.HUGGINGFACE]: new HuggingFaceProvider(
      config.providers[AI_PROVIDERS.HUGGINGFACE]?.apiKey || '',
      config.providers[AI_PROVIDERS.HUGGINGFACE]?.model || 'mistralai/Mistral-7B-Instruct-v0.1'
    ),
    [AI_PROVIDERS.MOCK]: new MockProvider(),
    [AI_PROVIDERS.CLAUDE]: new ClaudeProvider(
      config.providers[AI_PROVIDERS.CLAUDE]?.apiKey || '',
      config.providers[AI_PROVIDERS.CLAUDE]?.model || 'claude-3-haiku-20240307'
    ),
    [AI_PROVIDERS.BAIDU]: new BaiduProvider(
      config.providers[AI_PROVIDERS.BAIDU]?.apiKey || '',
      config.providers[AI_PROVIDERS.BAIDU]?.secretKey || '',
      config.providers[AI_PROVIDERS.BAIDU]?.model || 'ERNIE-Bot-4'
    ),
    [AI_PROVIDERS.XUNFEI]: new XunfeiProvider(
      config.providers[AI_PROVIDERS.XUNFEI]?.apiKey || '',
      config.providers[AI_PROVIDERS.XUNFEI]?.apiSecret || '',
      config.providers[AI_PROVIDERS.XUNFEI]?.appId || '',
      config.providers[AI_PROVIDERS.XUNFEI]?.model || 'general'
    ),
    [AI_PROVIDERS.DEEPSEEK]: new DeepSeekProvider(
      config.providers[AI_PROVIDERS.DEEPSEEK]?.apiKey || '',
      config.providers[AI_PROVIDERS.DEEPSEEK]?.model || 'deepseek-chat'
    ),
  };

  // ... existing code ...
} 