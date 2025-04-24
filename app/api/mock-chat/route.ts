import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    console.log("接收到模拟聊天请求");
    
    const body = await request.json();
    const { messages, scenario } = body;
    
    console.log("请求场景:", scenario);
    console.log("消息数量:", messages?.length);

    // 获取用户的最后一条消息
    let userMessage = "Hello";
    if (messages && Array.isArray(messages) && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'user') {
        userMessage = lastMessage.content;
      }
    }

    // 生成模拟响应
    const mockResponse = generateMockResponse(userMessage, scenario);
    
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log("模拟响应:", mockResponse);
    
    return NextResponse.json({
      response: mockResponse
    });
  } catch (error: any) {
    console.error('模拟聊天API错误:', error);
    
    return NextResponse.json(
      { error: '生成模拟响应失败: ' + error.message },
      { status: 500 }
    );
  }
}

function generateMockResponse(userMessage: string, scenario: string): string {
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