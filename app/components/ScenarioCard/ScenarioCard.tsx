import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

export interface Scenario {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  imageUrl?: string;
  exampleQuestions: string[];
}

interface ScenarioCardProps {
  scenario: Scenario;
  isSelected: boolean;
  onSelect: (scenario: Scenario) => void;
}

const DifficultyBadge: React.FC<{ difficulty: Scenario['difficulty'] }> = ({ difficulty }) => {
  const styles = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800'
  };

  const labels = {
    beginner: 'beginner',
    intermediate: 'intermediate',
    advanced: 'advanced'
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[difficulty]}`}>
      {labels[difficulty]}
    </span>
  );
};

const ScenarioCard: React.FC<ScenarioCardProps> = ({
  scenario,
  isSelected,
  onSelect,
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(scenario)}
      className={`
        relative overflow-hidden bg-white rounded-lg shadow-md hover:shadow-lg
        transition-all duration-200 cursor-pointer border
        ${isSelected ? 'ring-2 ring-blue-500 border-blue-300' : 'border-gray-200'}
      `}
    >
      <div className="aspect-[4/3] bg-gray-100 relative">
        {scenario.imageUrl ? (
          <Image
            src={scenario.imageUrl}
            alt={scenario.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <DifficultyBadge difficulty={scenario.difficulty} />
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{scenario.title}</h3>
        
        <p className="text-gray-600 text-sm">
          {scenario.description}
        </p>
        
        {isSelected && scenario.exampleQuestions.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-500 mb-2">Example Questions:</p>
            <ul className="text-xs text-gray-600 space-y-1">
              {scenario.exampleQuestions.slice(0, 3).map((question, i) => (
                <li key={i} className="pl-2 border-l-2 border-gray-200">{question}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ScenarioCard; 