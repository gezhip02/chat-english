import axios from 'axios';

interface VideoGenerationResponse {
  id: string;
  url: string;
  status: string;
}

class VideoService {
  async generateVideo(text: string, sourceUrl: string): Promise<VideoGenerationResponse> {
    try {
      console.log("Generating video with text:", text);
      console.log("Using source URL:", sourceUrl);
      
      // 调用我们的API路由而不是直接调用D-ID API
      const response = await axios.post('/api/d-id', {
        text,
        sourceUrl
      });

      return {
        id: response.data.id,
        url: response.data.url,
        status: response.data.status
      };
    } catch (error: any) {
      console.error('Error generating video:', error);
      throw new Error(error.response?.data?.error || 'Failed to generate video');
    }
  }
}

export const videoService = new VideoService(); 