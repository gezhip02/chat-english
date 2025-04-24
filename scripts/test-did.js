import dotenv from 'dotenv';
import axios from 'axios';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../.env.local') });

async function testDIDAPI() {
  console.log('Testing D-ID API...');
  const apiKey = process.env.NEXT_PUBLIC_D_ID_API_KEY;
  
  if (!apiKey) {
    console.log('❌ API Key not found');
    return;
  }
  
  console.log('API Key: ✓ Found');
  
  const [email, key] = apiKey.split(':');
  const authString = `${email}:${key}`;
  const base64Auth = Buffer.from(authString).toString('base64');
  
  try {
    const response = await axios.get('https://api.d-id.com/talks', {
      headers: {
        'Authorization': `Basic ${base64Auth}`,
      },
    });
    
    console.log('\n✓ D-ID API test successful!');
    console.log('\nResponse:', response.data);
  } catch (error) {
    console.log('\n❌ D-ID API test failed:', error.response?.data || error.message);
  }
}

testDIDAPI(); 