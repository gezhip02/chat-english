import { AIMessage, AIProvider, AIResponse } from './types';

export class DeepSeekProvider implements AIProvider {
  id = 'deepseek';
  name = 'DeepSeek';
  description = 'DeepSeek AI大模型，提供强大的自然语言理解能力';
  isFree = false;
  isAvailable = false;
  
  private apiKey: string;
  private model: string;
  private apiUrl: string = 'https://api.deepseek.com/v1/chat/completions';
  
  constructor(apiKey?: string, model: string = 'deepseek-chat') {
    this.apiKey = apiKey || '';
    this.model = model;
    this.isAvailable = !!apiKey;
  }
  
  async testConnection(): Promise<boolean> {
    if (!this.apiKey) return false;
    
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {role: 'system', content: 'You are a helpful assistant.'},
            {role: 'user', content: 'Test'}
          ],
          max_tokens: 5,
          stream: false
        })
      });
      
      if (!response.ok) {
        console.error('DeepSeek API error:', await response.text());
        return false;
      }
      
      const data = await response.json();
      return !!data.choices && data.choices.length > 0;
    } catch (error) {
      console.error('DeepSeek connection test failed:', error);
      this.isAvailable = false;
      return false;
    }
  }
  
  async generateResponse(messages: AIMessage[]): Promise<AIResponse> {
    if (!this.apiKey || !this.isAvailable) {
      throw new Error('DeepSeek provider is not available');
    }
    
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages,
          stream: false
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('DeepSeek API error:', errorText);
        throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('DeepSeek API returned empty response');
      }
      
      const content = data.choices[0].message.content;
      
      return {
        content,
        model: data.model || this.model,
        provider: this.id
      };
    } catch (error: any) {
      console.error('DeepSeek response generation failed:', error);
      throw new Error(`DeepSeek API error: ${error.message}`);
    }
  }
} 