import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET() {
  try {
    const apiKey = process.env.NEXT_PUBLIC_D_ID_API_KEY || '';
    
    // Create proper authentication header
    let authHeader = '';
    if (apiKey.includes(':')) {
      try {
        const base64Auth = Buffer.from(apiKey).toString('base64');
        authHeader = `Basic ${base64Auth}`;
      } catch (error) {
        console.error('Error encoding API key:', error);
        authHeader = `Basic ${apiKey}`;
      }
    } else {
      authHeader = `Basic ${apiKey}`;
    }
    
    // Test endpoint - get presentations
    const response = await axios.get('https://api.d-id.com/presentations', {
      headers: {
        'Authorization': authHeader,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'D-ID API test successful',
      data: response.data
    });
  } catch (error: any) {
    console.error('D-ID API test failed:', error);
    
    return NextResponse.json({
      success: false,
      message: 'D-ID API test failed',
      error: error.message,
      response: error.response?.data || null
    }, { status: 500 });
  }
} 