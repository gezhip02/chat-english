import { NextResponse } from 'next/server';
import { aiService } from '../../services/aiProviders';
import { AIMessage, AIServiceConfig, AI_PROVIDERS } from '../../services/aiProviders/types';

// 配置AI服务
const aiConfig: AIServiceConfig = {
  defaultProvider: process.env.DEFAULT_AI_PROVIDER || 'mock',
  providers: {
    [AI_PROVIDERS.OPENAI]: {
      apiKey: process.env.OPENAI_API_KEY?.trim(),
      model: 'gpt-3.5-turbo'
    },
    [AI_PROVIDERS.HUGGINGFACE]: {
      apiKey: process.env.HUGGINGFACE_API_KEY?.trim(),
      model: 'mistralai/Mistral-7B-Instruct-v0.2'
    },
    [AI_PROVIDERS.DEEPSEEK]: {
      apiKey: process.env.DEEPSEEK_API_KEY?.trim(),
      model: 'deepseek-chat'
    }
  }
};

// 初始化AI服务
let isInitialized = false;
async function initializeAIService() {
  if (!isInitialized) {
    console.log("正在初始化AI服务...");
    await aiService.initialize(aiConfig);
    isInitialized = true;
    
    // 测试所有提供商
    const testResults = await aiService.testProviders();
    console.log("AI提供商测试结果:", testResults);
  }
}

console.log("聊天API路由初始化中...");

export async function POST(request: Request) {
  try {
    console.log("接收到聊天请求");
    
    // 确保AI服务已初始化
    await initializeAIService();
    
    const body = await request.json();
    const { messages, scenario, provider } = body;
    
    console.log("请求场景:", scenario);
    console.log("请求消息数:", messages?.length);
    console.log("指定的提供商:", provider);

    if (!messages || !Array.isArray(messages)) {
      console.error("无效的消息格式:", messages);
      return NextResponse.json(
        { error: '无效的消息格式' },
        { status: 400 }
      );
    }

    // 设置场景
    aiService.setScenario(scenario);
    
    // 如果指定了提供商，尝试切换
    if (provider) {
      aiService.setProvider(provider);
    }
    
    // 添加系统提示以保持对话上下文
    const contextMessages: AIMessage[] = [
      {
        role: 'system',
        content: getScenarioContext(scenario)
      },
      ...messages
    ];

    console.log("正在生成AI响应...");
    const aiResponse = await aiService.generateResponse(contextMessages);
    
    console.log("AI响应生成成功:", {
      provider: aiResponse.provider,
      model: aiResponse.model,
      contentLength: aiResponse.content.length
    });

    return NextResponse.json({
      response: aiResponse.content,
      provider: aiResponse.provider,
      model: aiResponse.model
    });
  } catch (error: any) {
    console.error('聊天API错误:', error);
    
    return NextResponse.json(
      { error: '生成响应失败: ' + error.message },
      { status: 500 }
    );
  }
}

function getScenarioContext(scenario: string): string {
  const contexts: Record<string, string> = {
    'Coffee Shop Chat': 'You are a friendly barista at a coffee shop. Engage in natural conversation, take orders, and make small talk.',
    'Job Interview': 'You are a professional hiring manager conducting a job interview. Ask relevant questions and provide constructive feedback.',
    'Business Negotiation': 'You are a business professional in a negotiation meeting. Discuss terms, make proposals, and work towards agreements.',
  };
  
  const context = contexts[scenario] || 'You are a friendly English teacher having a natural conversation. Respond naturally as if in a real conversation. Keep responses concise and conversational. Engage the student in dialogue that helps improve their English speaking skills.';
  
  console.log(`选择场景 "${scenario}" 的上下文:`, context);
  return context;
} 