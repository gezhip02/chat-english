'use client';

import React, { useState, useEffect, useRef } from 'react';
import { chatService } from '../services/chatService';
import { dIdService } from '../services/dIdService';

// Add these type declarations at the top of the file
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function Chat({ scenario }: { scenario: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTalkId, setCurrentTalkId] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = async (event: any) => {
          const last = event.results.length - 1;
          const userInput = event.results[last][0].transcript;
          
          handleUserInput(userInput);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setError(`Speech recognition error: ${event.error}`);
          setIsListening(false);
        };
      }
    }

    // Initialize conversation with scenario
    chatService.initializeConversation(scenario);

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      chatService.clearConversation();
    };
  }, [scenario]);

  const handleUserInput = async (userInput: string) => {
    try {
      setIsProcessing(true);
      setError(null);

      // Add user message
      setMessages(prev => [...prev, { role: 'user', content: userInput }]);

      // Get AI response
      const response = await chatService.generateResponse(userInput);

      // Add AI response
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);

      // Create talking avatar video
      const talkId = await dIdService.createTalkingAvatar(response);
      setCurrentTalkId(talkId);

      // Poll for video status
      const checkStatus = async () => {
        const status = await dIdService.getTalkStatus(talkId);
        if (status.status === 'done') {
          setVideoUrl(status.result_url);
          if (videoRef.current) {
            videoRef.current.load();
            videoRef.current.play();
          }
        } else if (status.status === 'created' || status.status === 'processing') {
          setTimeout(checkStatus, 1000);
        }
      };

      checkStatus();
    } catch (error) {
      console.error('Error in conversation:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setError('Speech recognition is not supported in your browser');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
    setIsListening(!isListening);
  };

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto p-4">
      <div className="mb-4">
        {videoUrl && (
          <video
            ref={videoRef}
            className="w-full rounded-lg shadow-lg"
            controls
            autoPlay
          >
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        )}
      </div>

      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg ${
              message.role === 'user'
                ? 'bg-blue-100 ml-auto'
                : 'bg-gray-100'
            } max-w-[80%]`}
          >
            {message.content}
          </div>
        ))}
        {error && (
          <div className="text-red-500 p-2 text-center">{error}</div>
        )}
      </div>

      <div className="flex items-center justify-center gap-4">
        <button
          onClick={toggleListening}
          disabled={isProcessing}
          className={`px-6 py-3 rounded-full font-semibold ${
            isListening
              ? 'bg-red-500 text-white'
              : 'bg-blue-500 text-white'
          } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isListening ? 'Stop Listening' : 'Start Listening'}
        </button>
        {isProcessing && (
          <div className="text-gray-500">Processing...</div>
        )}
      </div>
    </div>
  );
} 