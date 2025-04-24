import React, { useState } from 'react';
import { motion } from 'framer-motion';

export interface Scenario {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  imageUrl: string;
}

interface ScenarioCardProps {
  scenario: Scenario;
  onSelect: (scenario: Scenario) => void;
}

const ScenarioCard: React.FC<ScenarioCardProps> = ({ scenario, onSelect }) => {
  const [imageStatus, setImageStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  
  const difficultyColors = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800',
  };

  // 内联SVG作为图片加载失败的备用
  const PlaceholderImage = () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <div className="text-gray-400 text-center p-4">
        <svg
          className="mx-auto h-12 w-12"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <p className="mt-2">{scenario.title}</p>
      </div>
    </div>
  );

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer"
      onClick={() => onSelect(scenario)}
    >
      <div className="relative h-48 bg-gray-100">
        {imageStatus === 'error' ? (
          <PlaceholderImage />
        ) : (
          <>
            {imageStatus === 'loading' && <PlaceholderImage />}
            <img
              src={scenario.imageUrl}
              alt={scenario.title}
              className={`w-full h-full object-cover ${imageStatus === 'loaded' ? 'block' : 'hidden'}`}
              onLoad={() => setImageStatus('loaded')}
              onError={() => setImageStatus('error')}
            />
          </>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{scenario.title}</h3>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              difficultyColors[scenario.difficulty]
            }`}
          >
            {scenario.difficulty}
          </span>
        </div>
        <p className="text-gray-600 text-sm">{scenario.description}</p>
      </div>
    </motion.div>
  );
};

export default ScenarioCard; 