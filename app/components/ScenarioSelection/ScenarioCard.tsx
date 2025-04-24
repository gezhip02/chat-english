import React from 'react';
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
  const difficultyColors = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer"
      onClick={() => onSelect(scenario)}
    >
      <div className="relative h-48">
        <img
          src={scenario.imageUrl}
          alt={scenario.title}
          className="w-full h-full object-cover"
        />
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