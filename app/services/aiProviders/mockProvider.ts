import { AIMessage, AIProvider, AIResponse } from './types';

export class MockProvider implements AIProvider {
  id = 'mock';
  name = '模拟AI';
  description = '离线模拟AI响应，用于测试和开发';
  isFree = true;
  isAvailable = true;
  
  private scenario: string = '';
  
  constructor(scenario: string = '') {
    this.scenario = scenario;
  }
  
  setScenario(scenario: string) {
    this.scenario = scenario;
  }
  
  async testConnection(): Promise<boolean> {
    return true; // 模拟提供商总是可用
  }
  
  async generateResponse(messages: AIMessage[]): Promise<AIResponse> {
    // 获取用户的最后一条消息
    let userMessage = "Hello";
    if (messages && messages.length > 0) {
      const userMessages = messages.filter(m => m.role === 'user');
      if (userMessages.length > 0) {
        userMessage = userMessages[userMessages.length - 1].content;
      }
    }
    
    // 生成模拟响应
    const mockResponse = this.generateMockResponse(userMessage, this.scenario);
    
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      content: mockResponse,
      model: 'mock-model',
      provider: this.id
    };
  }
  
  private generateMockResponse(userMessage: string, scenario: string): string {
    // 简单的关键词响应匹配
    const lowerMessage = userMessage.toLowerCase();
    
    // 基于场景选择不同的响应集
    switch(scenario) {
      case 'Coffee Shop Chat':
        if (lowerMessage.includes('coffee') || lowerMessage.includes('drink')) {
          return "Would you like to try our special blend today? It's from Colombia and has a wonderful aroma.";
        } else if (lowerMessage.includes('food') || lowerMessage.includes('eat')) {
          return "Our croissants are freshly baked this morning. Would you like one with your drink?";
        } else if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('how much')) {
          return "A regular coffee is $3.50, and our special blend is $4.25. Anything else you'd like to know?";
        }
        break;
        
      case 'Job Interview':
        if (lowerMessage.includes('experience') || lowerMessage.includes('work')) {
          return "That's interesting. Could you tell me more about your specific responsibilities in your previous role?";
        } else if (lowerMessage.includes('salary') || lowerMessage.includes('pay')) {
          return "The salary range for this position is competitive and based on experience. We also offer excellent benefits including health insurance and retirement plans.";
        } else if (lowerMessage.includes('weakness') || lowerMessage.includes('improve')) {
          return "That's a thoughtful reflection. How have you been working to improve in that area?";
        }
        break;
        
      case 'Business Negotiation':
        if (lowerMessage.includes('offer') || lowerMessage.includes('deal')) {
          return "I understand your position. However, we need to ensure this agreement benefits both parties. What if we adjust the terms to include...";
        } else if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
          return "While price is important, we should also consider the value of the long-term partnership. We can offer additional services that might offset the cost difference.";
        } else if (lowerMessage.includes('deadline') || lowerMessage.includes('time')) {
          return "We can meet your timeline, but we'll need to prioritize certain aspects of the project. Which components are most critical for the initial phase?";
        }
        break;
    }
    
    // 通用响应
    const genericResponses = [
      "That's an interesting point. Could you elaborate a bit more?",
      "I see what you mean. What are your thoughts on this?",
      "Thank you for sharing that. Let's discuss this further.",
      "I appreciate your perspective. How does this relate to your goals?",
      "That's helpful to know. Is there anything specific you'd like to focus on?",
      "I understand. Would you like to explore this topic in more depth?",
      "Good point. How do you feel about trying a different approach?",
      "I see. What aspects of this are most important to you?",
      "Interesting. Have you considered alternative options as well?",
      "Thanks for explaining. Let's move forward with this conversation."
    ];
    
    // 随机选择一个通用响应
    const randomIndex = Math.floor(Math.random() * genericResponses.length);
    return genericResponses[randomIndex];
  }
} 