// 在文件最顶部添加全局声明
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { videoService } from '../../services/videoService';
import { chatService } from '../../services/chatService';

interface VideoInterfaceProps {
  onSpeechStart: () => void;
  onSpeechEnd: () => void;
  scenarioTitle: string;
}

const VideoInterface: React.FC<VideoInterfaceProps> = ({ 
  onSpeechStart, 
  onSpeechEnd,
  scenarioTitle 
}) => {
  const [isListening, setIsListening] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const recognitionRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [useMockAPI, setUseMockAPI] = useState(false);

  const startAudioMonitoring = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;
      
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      
      const audioContext = audioContextRef.current;
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      microphone.connect(analyser);
      
      analyser.fftSize = 256;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      const checkAudioLevel = () => {
        if (!isListening) return;
        
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setAudioLevel(average);
        
        if (average < 5) {
          console.log('Low audio level detected:', average);
        }
        
        requestAnimationFrame(checkAudioLevel);
      };
      
      checkAudioLevel();
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError('无法访问麦克风。请确保麦克风已正确连接并授权使用。');
    }
  };

  const stopAudioMonitoring = () => {
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop());
      audioStreamRef.current = null;
    }
    setAudioLevel(0);
  };

  useEffect(() => {
    // Initialize conversation with scenario context
    chatService.initializeConversation(scenarioTitle);
    return () => {
      chatService.clearConversation();
      stopAudioMonitoring();
    };
  }, [scenarioTitle]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onstart = () => {
          setIsListening(true);
          onSpeechStart();
          setError(null);
          startAudioMonitoring();
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
          onSpeechEnd();
          stopAudioMonitoring();
          
          // 如果没有检测到语音，自动重新开始监听
          if (!transcript && !error) {
            console.log('No speech detected, restarting...');
            setTimeout(() => {
              recognitionRef.current?.start();
            }, 100);
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          if (event.error === 'no-speech') {
            setError('没有检测到声音。请确保麦克风正常工作并靠近麦克风说话。');
          } else if (event.error === 'not-allowed') {
            setError('麦克风访问被拒绝。请在浏览器设置中允许访问麦克风。');
          } else {
            setError('语音识别出错。请检查麦克风并重试。');
          }
          setIsListening(false);
          stopAudioMonitoring();
        };

        recognitionRef.current.onresult = async (event: any) => {
          const current = event.resultIndex;
          const transcript = event.results[current][0].transcript;
          setTranscript(transcript);

          if (event.results[current].isFinal && !isProcessing) {
            await handleSpeechResult(transcript);
          }
        };
      } else {
        setError('您的浏览器不支持语音识别。请使用 Chrome 浏览器。');
      }
    }
  }, [onSpeechStart, onSpeechEnd, isProcessing, scenarioTitle, transcript]);

  const handleSpeechResult = async (transcript: string) => {
    setIsProcessing(true);
    setCurrentMessage(transcript);
    console.log("Starting to process speech: ", transcript);
    try {
      // Get AI response
      console.log("Calling chatService.generateResponse...");
      const response = await chatService.generateResponse(transcript);
      console.log("AI response received: ", response);
      setCurrentMessage(`AI is responding: ${response}`);
      
      // Generate video with the response
      const avatarUrl = process.env.NEXT_PUBLIC_AVATAR_SOURCE_URL;
      console.log("Using avatar URL: ", avatarUrl);
      if (!avatarUrl) {
        console.error("Missing avatar URL in environment variables");
        setError('Avatar configuration is missing. Please check your environment settings.');
        return;
      }

      setIsGeneratingResponse(true);
      console.log("Calling videoService.generateVideo with:", {
        text: response,
        sourceUrl: avatarUrl
      });
      
      const video = await videoService.generateVideo(response, avatarUrl);
      console.log("Video generated successfully: ", video);
      setVideoUrl(video.url);
      
      // Reset video player when new video is loaded
      if (videoRef.current) {
        console.log("Loading and playing video...");
        videoRef.current.load();
        videoRef.current.play();
      }
    } catch (error) {
      console.error('Error processing response:', error);
      setError('处理响应时出错。请重试。');
    } finally {
      setIsProcessing(false);
      setIsGeneratingResponse(false);
      setCurrentMessage('');
    }
  };

  const toggleListening = async () => {
    if (isListening) {
      recognitionRef.current?.stop();
      stopAudioMonitoring();
    } else {
      setError(null);
      try {
        // 测试麦克风是否可用
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        
        recognitionRef.current?.start();
      } catch (error) {
        console.error('Failed to start speech recognition:', error);
        setError('无法访问麦克风。请确保麦克风已连接并授权使用。');
      }
    }
  };

  const toggleMockAPI = () => {
    const newState = !useMockAPI;
    setUseMockAPI(newState);
    chatService.setUseMockAPI(newState);
    console.log("Switched to mock API mode:", newState);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden"
      >
        {videoUrl ? (
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            src={videoUrl}
            autoPlay
            playsInline
            controls={false}
            onEnded={() => {
              console.log("Video playback ended, starting new conversation round");
              // 视频播放结束后，自动开始新一轮对话
              if (!isListening && !isProcessing) {
                toggleListening();
              }
            }}
            onError={(e) => {
              console.error("Video playback error:", e);
              setError(`视频播放错误: ${(e.target as HTMLVideoElement).error?.message || '未知错误'}`);
            }}
            onLoadStart={() => console.log("Video load started")}
            onCanPlay={() => console.log("Video can play now")}
            onPlay={() => console.log("Video started playing")}
          />
        ) : (
          <div className="flex items-center justify-center h-full flex-col gap-4">
            <div className="w-32 h-32 bg-gray-700 rounded-full flex items-center justify-center">
              <span className="text-4xl text-gray-400">AI</span>
            </div>
            <p className="text-white text-xl">
              {isGeneratingResponse ? 'Generating response...' : 'Ready to start conversation...'}
            </p>
          </div>
        )}
        
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 w-full max-w-md px-4">
          {error && (
            <div className="bg-red-500/80 text-white px-4 py-2 rounded-lg text-sm text-center w-full">
              {error}
            </div>
          )}
          {isListening && (
            <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
              <motion.div
                className="bg-green-500 h-full rounded-full"
                style={{ width: `${Math.min(100, audioLevel)}%` }}
                animate={{ width: `${Math.min(100, audioLevel)}%` }}
              />
            </div>
          )}
          {currentMessage && (
            <div className="bg-black/50 px-4 py-2 rounded-lg w-full">
              <p className="text-white text-sm text-center">{currentMessage}</p>
            </div>
          )}
          <button
            className={`px-6 py-3 rounded-full ${
              isProcessing || isGeneratingResponse
                ? 'bg-yellow-500 cursor-not-allowed'
                : isListening
                ? 'bg-red-500 animate-pulse'
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white font-medium transition-all w-full max-w-xs`}
            onClick={toggleListening}
            disabled={isProcessing || isGeneratingResponse}
          >
            {isGeneratingResponse 
              ? '生成回应中...' 
              : isProcessing 
              ? '处理中...' 
              : isListening 
              ? '正在听...' 
              : '开始说话'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default VideoInterface; 