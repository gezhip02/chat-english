import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config({ path: '.env.local' });

async function testDeepSeek() {
  try {
    console.log('Testing DeepSeek API...');
    console.log('API Key:', process.env.DEEPSEEK_API_KEY ? '✓ Found' : '✗ Missing');
    
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'Say hello and introduce yourself briefly.' }
        ],
        stream: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}\n${errorText}`);
    }

    const data = await response.json();
    console.log('\n✓ DeepSeek API test successful!');
    console.log('\nResponse:', data.choices[0].message.content);
    console.log('\nFull response data:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('\n✗ DeepSeek API test failed:', error.message);
  }
}

testDeepSeek(); 