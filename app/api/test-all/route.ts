import { NextResponse } from 'next/server';
import axios from 'axios';
import OpenAI from 'openai';

export async function GET() {
  const results = {
    openai: {
      success: false,
      message: '',
      error: null
    },
    did: {
      success: false,
      message: '',
      error: null
    },
    environment: {
      OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
      NEXT_PUBLIC_D_ID_API_KEY: !!process.env.NEXT_PUBLIC_D_ID_API_KEY,
      NEXT_PUBLIC_AVATAR_SOURCE_URL: !!process.env.NEXT_PUBLIC_AVATAR_SOURCE_URL
    }
  };

  // Test OpenAI API
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Hello, this is a test message.' }],
      max_tokens: 5
    });
    
    results.openai.success = true;
    results.openai.message = 'OpenAI API test successful';
  } catch (error: any) {
    results.openai.success = false;
    results.openai.message = 'OpenAI API test failed';
    results.openai.error = error.message;
  }

  // Test D-ID API
  try {
    const apiKey = process.env.NEXT_PUBLIC_D_ID_API_KEY || '';
    
    // Create proper authentication header
    let authHeader = '';
    if (apiKey.includes(':')) {
      try {
        const base64Auth = Buffer.from(apiKey).toString('base64');
        authHeader = `Basic ${base64Auth}`;
      } catch (error) {
        throw new Error(`Failed to encode API key: ${error}`);
      }
    } else {
      authHeader = `Basic ${apiKey}`;
    }
    
    // Test a simple endpoint
    const response = await axios.get('https://api.d-id.com/presentations', {
      headers: {
        'Authorization': authHeader,
      },
    });

    results.did.success = true;
    results.did.message = 'D-ID API test successful';
  } catch (error: any) {
    results.did.success = false;
    results.did.message = 'D-ID API test failed';
    results.did.error = error.message;
  }

  return NextResponse.json(results);
} 