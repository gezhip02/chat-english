import OpenAI from 'openai';
import { AIMessage, AIProvider, AIResponse } from './types';

export class OpenAIProvider implements AIProvider {
  id = 'openai';
  name = 'OpenAI';
  description = 'OpenAI API (GPT-3.5, GPT-4)';
  isFree = false;
  isAvailable = false;
  
  private client: OpenAI | null = null;
  private model: string;
  
  constructor(apiKey?: string, model: string = 'gpt-3.5-turbo') {
    this.model = model;
    
    if (apiKey) {
      try {
        this.client = new OpenAI({
          apiKey: apiKey.trim()
        });
        this.isAvailable = true;
      } catch (error) {
        console.error('Failed to initialize OpenAI client:', error);
        this.isAvailable = false;
      }
    }
  }
  
  async testConnection(): Promise<boolean> {
    if (!this.client) return false;
    
    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: 'Test' }],
        max_tokens: 5
      });
      
      return !!response;
    } catch (error) {
      console.error('OpenAI connection test failed:', error);
      this.isAvailable = false;
      return false;
    }
  }
  
  async generateResponse(messages: AIMessage[]): Promise<AIResponse> {
    if (!this.client || !this.isAvailable) {
      throw new Error('OpenAI provider is not available');
    }
    
    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: messages as any,
        temperature: 0.7,
        max_tokens: 150
      });
      
      const content = response.choices[0]?.message?.content || '';
      
      return {
        content,
        model: response.model,
        provider: this.id
      };
    } catch (error: any) {
      console.error('OpenAI response generation failed:', error);
      throw new Error(`OpenAI API error: ${error.message}`);
    }
  }
} 