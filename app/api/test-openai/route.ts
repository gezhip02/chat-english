import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function GET() {
  // 测试结果对象
  const result = {
    success: false,
    message: '',
    apiKeyInfo: {
      present: false,
      length: 0,
      prefix: '',
      hasTrailingSpace: false
    },
    error: null as any,
    response: null as any
  };

  try {
    // 获取API密钥并进行基本检查
    const apiKey = process.env.OPENAI_API_KEY || '';
    result.apiKeyInfo.present = !!apiKey;
    result.apiKeyInfo.length = apiKey.length;
    result.apiKeyInfo.prefix = apiKey.substring(0, 10) + '...';
    result.apiKeyInfo.hasTrailingSpace = apiKey.endsWith(' ');
    
    // 如果API密钥不存在，则返回错误
    if (!apiKey) {
      result.message = 'API密钥不存在';
      return NextResponse.json(result, { status: 400 });
    }

    console.log('测试OpenAI API密钥');
    console.log('API密钥存在:', !!apiKey);
    console.log('API密钥长度:', apiKey.length);
    console.log('API密钥前缀:', apiKey.substring(0, 10) + '...');
    console.log('API密钥有尾随空格:', apiKey.endsWith(' '));
    
    // 创建OpenAI客户端，确保移除可能的尾随空格
    const openai = new OpenAI({
      apiKey: apiKey.trim()
    });
    
    // 发送一个简单的请求来测试API密钥
    console.log('发送测试请求到OpenAI API...');
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Say "API key is working!" in Chinese' }],
      max_tokens: 20
    });
    
    // 检查响应
    if (response && response.choices && response.choices.length > 0) {
      const content = response.choices[0].message.content;
      result.success = true;
      result.message = 'API密钥有效';
      result.response = {
        content: content,
        model: response.model,
        id: response.id
      };
      
      console.log('API测试成功:', content);
    } else {
      result.message = 'API响应无效';
      result.response = response;
      console.log('API响应无效:', response);
    }
    
    return NextResponse.json(result);
  } catch (error: any) {
    // 捕获并返回详细的错误信息
    console.error('API测试失败:', error);
    
    result.success = false;
    result.message = 'API测试失败';
    result.error = {
      message: error.message,
      type: error.type,
      code: error.code,
      param: error.param,
      stack: error.stack?.split('\n').slice(0, 3).join('\n')
    };
    
    return NextResponse.json(result, { status: 500 });
  }
} 