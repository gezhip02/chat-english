import { AIMessage, AIProvider, AIResponse, AIServiceConfig, AI_PROVIDERS } from './types';
import { OpenAIProvider } from './openAIProvider';
import { HuggingFaceProvider } from './huggingFaceProvider';
import { MockProvider } from './mockProvider';
import { DeepSeekProvider } from './deepSeekProvider';

class AIService {
  private providers: Record<string, AIProvider> = {};
  private currentProviderId: string;
  private scenario: string = '';

  constructor() {
    // 默认设置为模拟提供商
    this.providers[AI_PROVIDERS.MOCK] = new MockProvider();
    this.currentProviderId = AI_PROVIDERS.MOCK;
  }

  /**
   * 初始化所有提供商
   */
  async initialize(config: AIServiceConfig, scenario: string = '') {
    this.scenario = scenario;
    
    // 注册所有配置的提供商
    for (const [providerId, providerConfig] of Object.entries(config.providers)) {
      if (providerId === AI_PROVIDERS.OPENAI && providerConfig.apiKey) {
        this.providers[providerId] = new OpenAIProvider(
          providerConfig.apiKey,
          providerConfig.model || 'gpt-3.5-turbo'
        );
      } 
      else if (providerId === AI_PROVIDERS.HUGGINGFACE && providerConfig.apiKey) {
        this.providers[providerId] = new HuggingFaceProvider(
          providerConfig.apiKey,
          providerConfig.model || 'mistralai/Mistral-7B-Instruct-v0.2'
        );
      }
      else if (providerId === AI_PROVIDERS.DEEPSEEK && providerConfig.apiKey) {
        this.providers[providerId] = new DeepSeekProvider(
          providerConfig.apiKey,
          providerConfig.model || 'deepseek-chat'
        );
      }
      // 这里可以添加更多提供商
    }
    
    // 确保模拟提供商总是可用的
    if (!this.providers[AI_PROVIDERS.MOCK]) {
      this.providers[AI_PROVIDERS.MOCK] = new MockProvider(scenario);
    } else if (this.providers[AI_PROVIDERS.MOCK] instanceof MockProvider) {
      (this.providers[AI_PROVIDERS.MOCK] as MockProvider).setScenario(scenario);
    }
    
    // 设置默认提供商
    if (config.defaultProvider && this.providers[config.defaultProvider]) {
      this.currentProviderId = config.defaultProvider;
    } else {
      // 如果默认提供商不可用，尝试找到任何可用的提供商
      const availableProvider = Object.entries(this.providers)
        .find(([_, provider]) => provider.isAvailable);
      
      if (availableProvider) {
        this.currentProviderId = availableProvider[0];
      } else {
        // 如果没有可用的提供商，使用模拟提供商
        this.currentProviderId = AI_PROVIDERS.MOCK;
      }
    }
    
    console.log(`AI服务初始化完成，当前使用提供商: ${this.currentProviderId}`);
    return this.getAvailableProviders();
  }
  
  /**
   * 测试所有提供商连接
   */
  async testProviders(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};
    
    for (const [id, provider] of Object.entries(this.providers)) {
      try {
        results[id] = await provider.testConnection();
      } catch (error) {
        console.error(`测试提供商 ${id} 失败:`, error);
        results[id] = false;
      }
    }
    
    return results;
  }
  
  /**
   * 获取所有可用的提供商
   */
  getAvailableProviders(): AIProvider[] {
    return Object.values(this.providers)
      .filter(provider => provider.isAvailable);
  }
  
  /**
   * 获取当前活跃的提供商
   */
  getCurrentProvider(): AIProvider {
    return this.providers[this.currentProviderId];
  }
  
  /**
   * 设置要使用的提供商
   */
  setProvider(providerId: string): boolean {
    if (this.providers[providerId] && this.providers[providerId].isAvailable) {
      this.currentProviderId = providerId;
      console.log(`切换到AI提供商: ${providerId}`);
      return true;
    }
    return false;
  }
  
  /**
   * 更新场景
   */
  setScenario(scenario: string) {
    this.scenario = scenario;
    // 更新模拟提供商的场景
    if (this.providers[AI_PROVIDERS.MOCK] instanceof MockProvider) {
      (this.providers[AI_PROVIDERS.MOCK] as MockProvider).setScenario(scenario);
    }
  }
  
  /**
   * 生成AI响应
   */
  async generateResponse(messages: AIMessage[]): Promise<AIResponse> {
    const provider = this.providers[this.currentProviderId];
    
    if (!provider || !provider.isAvailable) {
      // 如果当前提供商不可用，回退到模拟提供商
      console.log(`提供商 ${this.currentProviderId} 不可用，回退到模拟提供商`);
      this.currentProviderId = AI_PROVIDERS.MOCK;
      return this.providers[AI_PROVIDERS.MOCK].generateResponse(messages);
    }
    
    try {
      console.log(`使用提供商 ${this.currentProviderId} 生成响应`);
      return await provider.generateResponse(messages);
    } catch (error) {
      console.error(`使用提供商 ${this.currentProviderId} 生成响应失败:`, error);
      
      // 自动回退到模拟提供商
      console.log('回退到模拟提供商');
      this.currentProviderId = AI_PROVIDERS.MOCK;
      return this.providers[AI_PROVIDERS.MOCK].generateResponse(messages);
    }
  }
}

// 导出单例实例
export const aiService = new AIService(); 