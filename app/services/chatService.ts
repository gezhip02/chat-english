import { aiService } from './aiProviders';
import { AIMessage } from './aiProviders/types';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

class ChatService {
  private messages: Message[] = [];
  private currentScenario: string = '';
  private useMockAPI: boolean = false;

  initializeConversation(scenario: string) {
    this.messages = [];
    this.currentScenario = scenario;
    this.useMockAPI = false;
    
    // 设置AI服务的场景
    aiService.setScenario(scenario);
    
    console.log("ChatService initialized with scenario:", scenario);
  }

  clearConversation() {
    this.messages = [];
    this.currentScenario = '';
    this.useMockAPI = false;
    console.log("ChatService conversation cleared");
  }

  async generateResponse(userInput: string): Promise<string> {
    try {
      console.log("Generating response for user input:", userInput);
      console.log("Current scenario:", this.currentScenario);
      console.log("Using mock API:", this.useMockAPI);
      
      // Add user message to conversation history
      this.messages.push({
        role: 'user',
        content: userInput
      });
      
      console.log("Messages in conversation history:", this.messages.length);
      
      // 使用AI服务生成响应
      console.log("Sending request to AI service...");
      
      // 将消息转换为AIMessage格式
      const aiMessages: AIMessage[] = this.messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      // 根据useMockAPI标志决定是否使用模拟提供商
      if (this.useMockAPI) {
        aiService.setProvider('mock');
      }
      
      // 生成响应
      const aiResponse = await aiService.generateResponse(aiMessages);
      console.log("AI response received:", {
        provider: aiResponse.provider,
        model: aiResponse.model,
        content: aiResponse.content.substring(0, 50) + '...' // 仅记录内容的前50个字符
      });
      
      // Add assistant response to conversation history
      this.messages.push({
        role: 'assistant',
        content: aiResponse.content
      });

      return aiResponse.content;
    } catch (error: any) {
      console.error('Error generating response:', error);
      console.error('Error details:', error.message);
      throw error;
    }
  }
  
  // 添加显式切换到模拟API的方法
  setUseMockAPI(useMock: boolean) {
    this.useMockAPI = useMock;
    if (useMock) {
      aiService.setProvider('mock');
    }
    console.log("Explicitly set to use mock API:", useMock);
  }
  
  // 获取当前活跃的提供商
  getCurrentProvider(): string {
    return aiService.getCurrentProvider().id;
  }
  
  // 设置要使用的提供商
  setProvider(providerId: string): boolean {
    return aiService.setProvider(providerId);
  }
  
  // 获取所有可用的提供商
  getAvailableProviders() {
    return aiService.getAvailableProviders();
  }
}

export const chatService = new ChatService(); 