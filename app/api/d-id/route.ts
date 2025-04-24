import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text, sourceUrl } = body;
    
    const apiKey = process.env.NEXT_PUBLIC_D_ID_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'D-ID API key is missing' }, { status: 500 });
    }

    // 从环境变量中获取 email:key 格式的 API key
    const [email, key] = apiKey.split(':');
    if (!email || !key) {
      return NextResponse.json({ error: 'Invalid D-ID API key format' }, { status: 500 });
    }

    // 创建 Basic Auth 头
    const authString = `${email}:${key}`;
    const base64Auth = Buffer.from(authString).toString('base64');
    const authHeader = `Basic ${base64Auth}`;

    console.log('Attempting to create D-ID talk with auth:', { email, hasKey: !!key });
    console.log('Request parameters:', { text, sourceUrl });

    // Create video talk
    const createResponse = await axios.post(
      'https://api.d-id.com/talks',
      {
        source_url: sourceUrl,
        script: {
          type: 'text',
          input: text,
          provider: {
            type: "microsoft",
            voice_id: "en-US-JennyNeural"
          }
        },
        config: {
          stitch: true,
        },
        driver_url: "bank://lively"
      },
      {
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('D-ID talk created successfully');

    // Poll for video status
    const talkId = createResponse.data.id;
    let status = 'created';
    let resultUrl = '';
    let attempts = 0;
    const maxAttempts = 20;

    while (status !== 'done' && attempts < maxAttempts) {
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const statusResponse = await axios.get(
        `https://api.d-id.com/talks/${talkId}`,
        {
          headers: {
            'Authorization': authHeader,
          },
        }
      );
      
      status = statusResponse.data.status;
      if (status === 'done') {
        resultUrl = statusResponse.data.result_url;
        console.log('Video generation completed:', { talkId, resultUrl });
      } else if (status === 'error') {
        console.error('D-ID reported video generation error');
        throw new Error('Video generation failed');
      } else {
        console.log(`Video generation status: ${status} (attempt ${attempts}/${maxAttempts})`);
      }
    }

    if (attempts >= maxAttempts && status !== 'done') {
      throw new Error('Video generation timed out');
    }

    return NextResponse.json({
      id: talkId,
      url: resultUrl,
      status: status
    });
  } catch (error: any) {
    console.error('Error in D-ID API:', error.response?.data || error.message);
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || error.message;
    return NextResponse.json({ 
      error: message,
      details: error.response?.data
    }, { status });
  }
} 