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
  const [isPaused, setIsPaused] = useState(false);
  const [conversationActive, setConversationActive] = useState(false);

  const startAudioMonitoring = async () => {
    if (isPaused) return;
    
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
        if (!isListening || isPaused) return;
        
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

  // 当暂停状态变化时，确保停止语音识别
  useEffect(() => {
    if (isPaused && isListening) {
      recognitionRef.current?.stop();
      stopAudioMonitoring();
    }
  }, [isPaused, isListening]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onstart = () => {
          // 如果在暂停状态，立即停止语音识别
          if (isPaused) {
            console.log("Recognition started while paused - stopping");
            recognitionRef.current?.stop();
            return;
          }
          setIsListening(true);
          onSpeechStart();
          setError(null);
          startAudioMonitoring();
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
          onSpeechEnd();
          stopAudioMonitoring();
          
          // 只有在对话活跃且未暂停时才自动重启
          if (!transcript && !error && conversationActive && !isPaused) {
            console.log('No speech detected, restarting...');
            setTimeout(() => {
              if (conversationActive && !isPaused) {
                recognitionRef.current?.start();
              }
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
          // 如果暂停了，不处理语音识别结果
          if (isPaused) return;
          
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
  }, [onSpeechStart, onSpeechEnd, isProcessing, scenarioTitle, transcript, isPaused, conversationActive]);

  const handleSpeechResult = async (transcript: string) => {
    // 如果暂停了或不在活跃对话中，不处理语音
    if (isPaused || !conversationActive) {
      console.log("Speech processing skipped - isPaused:", isPaused, "conversationActive:", conversationActive);
      return;
    }
    
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

  // 合并开始对话/暂停对话功能
  const toggleConversation = async () => {
    // 如果已经处于对话状态，则切换暂停/继续
    if (conversationActive) {
      const newPausedState = !isPaused;
      setIsPaused(newPausedState);
      
      if (newPausedState) {
        console.log("Pausing conversation...");
        // 暂停所有功能
        if (isListening) {
          console.log("Stopping speech recognition");
          recognitionRef.current?.stop();
          stopAudioMonitoring();
        }
        if (videoRef.current && !videoRef.current.paused) {
          console.log("Pausing video playback");
          videoRef.current.pause();
        }
        // 确保所有处理都停止
        setIsProcessing(false);
        setIsGeneratingResponse(false);
        setCurrentMessage('');
      } else {
        console.log("Resuming conversation...");
        // 继续对话
        if (videoRef.current && videoRef.current.paused) {
          console.log("Resuming video playback");
          videoRef.current.play();
        }
        
        // 重新开始语音识别，但要确保不在视频播放时启动
        if (!isListening && !isProcessing && (!videoRef.current || videoRef.current.ended)) {
          console.log("Restarting speech recognition");
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop());
            recognitionRef.current?.start();
          } catch (error) {
            console.error('Failed to restart speech recognition:', error);
            setError('无法访问麦克风。请确保麦克风已连接并授权使用。');
          }
        }
      }
    } else {
      // 开始全新对话
      setConversationActive(true);
      setIsPaused(false);
      setError(null);
      setIsGeneratingResponse(true);
      
      try {
        // 生成开场白视频
        const avatarUrl = process.env.NEXT_PUBLIC_AVATAR_SOURCE_URL;
        if (!avatarUrl) {
          throw new Error('Avatar configuration is missing');
        }

        // 获取开场白文本
        const greeting = await chatService.getInitialGreeting();
        console.log("Got initial greeting:", greeting);

        // 生成开场白视频
        const video = await videoService.generateVideo(greeting, avatarUrl);
        console.log("Generated initial video:", video);
        setVideoUrl(video.url);
        
        // 准备视频播放
        if (videoRef.current) {
          videoRef.current.load();
          videoRef.current.play();
        }

        // 测试麦克风是否可用
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        
        // 开始语音识别
        recognitionRef.current?.start();
      } catch (error) {
        console.error('Failed to start conversation:', error);
        setError('启动对话失败。请检查麦克风并重试。');
        setConversationActive(false);
      } finally {
        setIsGeneratingResponse(false);
      }
    }
  };

  const toggleMockAPI = () => {
    const newState = !useMockAPI;
    setUseMockAPI(newState);
    chatService.setUseMockAPI(newState);
    console.log("Switched to mock API mode:", newState);
  };

  // 确定按钮的状态和文本
  const getButtonState = () => {
    if (!conversationActive) {
      return {
        text: "开始对话",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
        ),
        bgColor: "bg-green-500 hover:bg-green-600"
      };
    } else if (isPaused) {
      return {
        text: "继续对话",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
        ),
        bgColor: "bg-green-500 hover:bg-green-600"
      };
    } else {
      return {
        text: "暂停对话",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        ),
        bgColor: "bg-red-500 hover:bg-red-600"
      };
    }
  };

  const buttonState = getButtonState();

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden"
      >
        {videoUrl ? (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              src={videoUrl}
              autoPlay
              playsInline
              controls={false}
              onEnded={() => {
                console.log("Video playback ended, starting new conversation round");
                // 只有在对话活跃且未暂停时才继续
                if (!isListening && !isProcessing && conversationActive && !isPaused) {
                  try {
                    recognitionRef.current?.start();
                  } catch (error) {
                    console.error("Failed to restart after video ended:", error);
                  }
                }
              }}
              onError={(e) => {
                console.error("Video playback error:", e);
                setError(`视频播放错误: ${(e.target as HTMLVideoElement).error?.message || '未知错误'}`);
              }}
              onLoadStart={() => console.log("Video load started")}
            />
            
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
              <button
                onClick={toggleConversation}
                className={`px-6 py-3 rounded-full font-semibold text-white ${buttonState.bgColor} transition duration-200 flex items-center gap-2`}
                disabled={isProcessing}
              >
                {buttonState.icon}
                {buttonState.text}
              </button>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {isGeneratingResponse ? (
              <div className="text-white text-center">
                <div className="mb-4">生成视频中...</div>
                <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            ) : (
              <div className="text-white text-center p-8">
                <button
                  onClick={toggleConversation}
                  className={`px-6 py-3 rounded-full font-semibold text-white ${buttonState.bgColor} transition duration-200 flex items-center gap-2 mx-auto mb-4`}
                  disabled={isProcessing}
                >
                  {buttonState.icon}
                  {buttonState.text}
                </button>
                <p className="text-sm opacity-75">{scenarioTitle}</p>
              </div>
            )}
          </div>
        )}
      </motion.div>

      <div className="mt-6 p-4 bg-white rounded-lg shadow">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {!conversationActive 
                ? '准备就绪' 
                : isProcessing 
                  ? '处理中...' 
                  : isListening && !isPaused 
                    ? '正在听...' 
                    : isPaused 
                      ? '已暂停' 
                      : '等待回应'}
            </span>
            {isListening && !isPaused && (
              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all duration-100"
                  style={{ width: `${Math.min(audioLevel * 2, 100)}%` }}
                />
              </div>
            )}
          </div>
        </div>

        {currentMessage && (
          <div className="mt-4 p-3 bg-blue-50 rounded text-blue-800">
            {currentMessage}
          </div>
        )}
        {error && (
          <div className="mt-4 p-3 bg-red-50 rounded text-red-800">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoInterface; 