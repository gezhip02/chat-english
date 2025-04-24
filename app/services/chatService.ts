import { aiService } from './aiProviders';
import { AIMessage } from './aiProviders/types';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

type ScenarioType = 'weather' | 'food' | 'colors' | 'hobbies' | 'coffee-shop' | 'job-interview' | 'travel' | 'business-negotiation';
type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

class ChatService {
  private messages: Message[] = [];
  private currentScenario: ScenarioType | '' = '';
  private currentDifficulty: DifficultyLevel = 'beginner';
  private useMockAPI: boolean = false;

  private getScenarioPrompt(scenario: ScenarioType, difficulty: DifficultyLevel): string {
    // 基础提示，根据难度调整AI的行为
    const difficultyPrompts = {
      beginner: `You are a friendly English teacher helping beginners practice English. 
        Use simple vocabulary and speak slowly. 
        Provide gentle corrections for basic mistakes.
        Encourage the student and keep the conversation easy to follow.
        If the student makes a mistake, provide the correct form naturally in your response.`,
      
      intermediate: `You are an English teacher helping intermediate students improve their English.
        Use natural speech speed and common expressions.
        Correct significant errors and introduce new vocabulary when appropriate.
        Encourage more detailed responses from the student.`,
      
      advanced: `You are an English teacher working with advanced students.
        Use natural speech patterns and sophisticated vocabulary.
        Focus on nuanced corrections and advanced language points.
        Challenge the student to express complex ideas.`
    };

    // 场景特定的提示
    const scenarioPrompts: Record<ScenarioType, string> = {
      weather: `Focus on weather vocabulary, seasons, and temperature. 
        Help students describe different weather conditions and express preferences.`,
      
      food: `Focus on food vocabulary, tastes, and dining experiences. 
        Help students describe dishes and express food preferences.`,
      
      colors: `Focus on color vocabulary and descriptive language. 
        Help students describe objects and express preferences using colors.`,
      
      hobbies: `Focus on activity vocabulary and expressing interests. 
        Help students discuss their free time activities and preferences.`,
      
      'coffee-shop': `Focus on ordering vocabulary and casual conversation. 
        Help students practice common cafe interactions and small talk.`,
      
      'job-interview': `Focus on professional vocabulary and formal language. 
        Help students practice common interview questions and professional responses.`,
      
      travel: `Focus on travel vocabulary and planning discussions. 
        Help students discuss destinations, experiences, and preferences.`,
      
      'business-negotiation': `Focus on business vocabulary and negotiation skills. 
        Help students practice professional negotiations and deal-making.`
    };

    return `${difficultyPrompts[difficulty]}\n\n${scenarioPrompts[scenario]}`;
  }

  initializeConversation(scenario: ScenarioType, difficulty: DifficultyLevel = 'beginner') {
    this.messages = [];
    this.currentScenario = scenario;
    this.currentDifficulty = difficulty;
    this.useMockAPI = false;
    
    // 设置场景特定的系统提示
    const systemPrompt = this.getScenarioPrompt(scenario, difficulty);
    this.messages.push({
      role: 'system',
      content: systemPrompt
    });
    
    // 设置AI服务的场景
    aiService.setScenario(scenario);
    
    console.log("ChatService initialized with:", {
      scenario,
      difficulty,
      systemPrompt
    });
  }

  clearConversation() {
    this.messages = [];
    this.currentScenario = '';
    this.currentDifficulty = 'beginner';
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

  async getInitialGreeting(): Promise<string> {
    try {
      // 根据难度和场景生成合适的问候语
      const greetings: Record<DifficultyLevel, Record<ScenarioType, string>> = {
        beginner: {
          weather: "Hi! Let's talk about the weather today. How's the weather in your area?",
          food: "Hello! I'd love to talk about food with you. What's your favorite type of food?",
          colors: "Hi there! Let's talk about colors. What's your favorite color?",
          hobbies: "Hello! I'd love to hear about your hobbies. What do you like to do in your free time?",
          'coffee-shop': "Hi! Welcome to our coffee shop. What can I get for you today?",
          'job-interview': "",
          'travel': "",
          'business-negotiation': ""
        },
        intermediate: {
          weather: "",
          food: "",
          colors: "",
          hobbies: "",
          'coffee-shop': "",
          'job-interview': "Hello! Thank you for coming in today. Shall we start the interview?",
          'travel': "Hi there! I heard you're planning a trip. Where would you like to go?",
          'business-negotiation': ""
        },
        advanced: {
          weather: "",
          food: "",
          colors: "",
          hobbies: "",
          'coffee-shop': "",
          'job-interview': "",
          'travel': "",
          'business-negotiation': "Good morning! I understand we're here to discuss the terms of our agreement."
        }
      };

      const defaultGreeting = "Hello! I'm your English teacher for today. Let's have a nice conversation!";
      
      const greeting = this.currentScenario && this.currentDifficulty
        ? (greetings[this.currentDifficulty][this.currentScenario] || defaultGreeting)
        : defaultGreeting;

      const aiMessages: AIMessage[] = [{
        role: 'system',
        content: this.getScenarioPrompt(this.currentScenario as ScenarioType, this.currentDifficulty)
      }, {
        role: 'assistant',
        content: greeting
      }];
      
      return greeting;
    } catch (error: any) {
      console.error('Error generating initial greeting:', error);
      return "Hello! I'm your English teacher for today. Let's start our conversation!";
    }
  }
}

export const chatService = new ChatService(); 