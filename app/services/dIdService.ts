export class DIdService {
  private apiKey: string;
  private avatarUrl: string;
  private authHeader: string;

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_D_ID_API_KEY || '';
    this.avatarUrl = process.env.NEXT_PUBLIC_AVATAR_SOURCE_URL || '';
    
    // Create proper authentication header
    if (this.apiKey.includes(':')) {
      try {
        // Use Buffer for Node.js or browser's btoa
        const base64Auth = typeof Buffer !== 'undefined' 
          ? Buffer.from(this.apiKey).toString('base64')
          : btoa(this.apiKey);
        this.authHeader = `Basic ${base64Auth}`;
      } catch (error) {
        console.error('Error encoding API key:', error);
        // Fallback to direct usage if encoding fails
        this.authHeader = `Basic ${this.apiKey}`;
      }
    } else {
      this.authHeader = `Basic ${this.apiKey}`;
    }
    
    console.log("DIdService initialized");
    console.log("D-ID API key present:", !!this.apiKey);
    console.log("Avatar URL present:", !!this.avatarUrl);
  }

  async createTalkingAvatar(text: string): Promise<string> {
    try {
      console.log("Creating talking avatar with text:", text);
      const response = await fetch('https://api.d-id.com/talks', {
        method: 'POST',
        headers: {
          'Authorization': this.authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          script: {
            type: 'text',
            input: text,
            provider: {
              type: 'microsoft',
              voice_id: 'en-US-JennyNeural'
            }
          },
          source_url: this.avatarUrl,
          config: {
            stitch: true,
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("D-ID API error:", {
          status: response.status,
          statusText: response.statusText,
          data: errorData
        });
        throw new Error(`D-ID API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log("D-ID talk created successfully:", data.id);
      return data.id;
    } catch (error: any) {
      console.error('Error creating talking avatar:', error);
      console.error('Error details:', error.message);
      throw error;
    }
  }

  async getTalkStatus(talkId: string): Promise<any> {
    try {
      console.log("Checking talk status for ID:", talkId);
      const response = await fetch(`https://api.d-id.com/talks/${talkId}`, {
        headers: {
          'Authorization': this.authHeader,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("D-ID API status check error:", {
          status: response.status,
          statusText: response.statusText,
          data: errorData
        });
        throw new Error(`D-ID API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Talk status:", data.status);
      if (data.result_url) {
        console.log("Result URL available:", data.result_url);
      }
      return data;
    } catch (error: any) {
      console.error('Error getting talk status:', error);
      console.error('Error details:', error.message);
      throw error;
    }
  }
}

export const dIdService = new DIdService(); 