import { AIMessage, AIProvider, AIResponse } from './types';

export class HuggingFaceProvider implements AIProvider {
  id = 'huggingface';
  name = 'Hugging Face';
  description = '使用Hugging Face Inference API访问开源大型语言模型';
  isFree = true; // 有免费使用额度
  isAvailable = false;
  
  private apiKey: string;
  private model: string;
  private apiUrl: string;
  
  constructor(apiKey?: string, model: string = 'mistralai/Mistral-7B-Instruct-v0.2') {
    this.apiKey = apiKey || '';
    this.model = model;
    this.apiUrl = `https://api-inference.huggingface.co/models/${model}`;
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
          inputs: "Hello, how are you?",
          parameters: { max_new_tokens: 5 }
        })
      });
      
      return response.ok;
    } catch (error) {
      console.error('Hugging Face connection test failed:', error);
      this.isAvailable = false;
      return false;
    }
  }
  
  async generateResponse(messages: AIMessage[]): Promise<AIResponse> {
    if (!this.apiKey || !this.isAvailable) {
      throw new Error('Hugging Face provider is not available');
    }
    
    try {
      // 构造适合Hugging Face API的格式
      const prompt = this.formatMessagesToPrompt(messages);
      
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 150,
            temperature: 0.7,
            return_full_text: false
          }
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Hugging Face API error: ${error.error || response.statusText}`);
      }
      
      const result = await response.json();
      const content = Array.isArray(result) ? result[0].generated_text : result.generated_text;
      
      return {
        content,
        model: this.model,
        provider: this.id
      };
    } catch (error: any) {
      console.error('Hugging Face response generation failed:', error);
      throw new Error(`Hugging Face API error: ${error.message}`);
    }
  }
  
  private formatMessagesToPrompt(messages: AIMessage[]): string {
    let prompt = '';
    
    // 根据不同的模型可能需要不同的格式，这里使用通用的格式
    for (const message of messages) {
      if (message.role === 'system') {
        // 系统提示放在最前面，通常作为指令
        prompt = `<|system|>\n${message.content}\n` + prompt;
      } else if (message.role === 'user') {
        prompt += `<|user|>\n${message.content}\n`;
      } else if (message.role === 'assistant') {
        prompt += `<|assistant|>\n${message.content}\n`;
      }
    }
    
    // 添加最后的助手提示，表明我们需要生成助手的回应
    prompt += `<|assistant|>\n`;
    
    return prompt;
  }
} 