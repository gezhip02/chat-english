import React, { useState } from 'react';
import ScenarioCard, { Scenario } from '../ScenarioCard/ScenarioCard';

// Define all scenarios
export const allScenarios: Record<string, Scenario[]> = {
  beginner: [
    {
      id: 'weather',
      title: 'Weather Talk',
      description: 'Practice talking about weather, seasons, and temperature',
      difficulty: 'beginner',
      imageUrl: '/images/scenarios/weather.jpg',
      exampleQuestions: [
        "How's the weather today?",
        "What's your favorite season?",
        "Do you like rainy days?"
      ]
    },
    {
      id: 'food',
      title: 'Food & Dining',
      description: 'Talk about food preferences and dining experiences',
      difficulty: 'beginner',
      imageUrl: '/images/scenarios/food.jpg',
      exampleQuestions: [
        "What's your favorite food?",
        "How often do you cook?",
        "What did you have for breakfast?"
      ]
    },
    {
      id: 'colors',
      title: 'Colors & Preferences',
      description: 'Express preferences and describe things using colors',
      difficulty: 'beginner',
      imageUrl: '/images/scenarios/colors.jpg',
      exampleQuestions: [
        "What's your favorite color?",
        "Why do you like this color?",
        "What colors do you usually wear?"
      ]
    },
    {
      id: 'hobbies',
      title: 'Hobbies & Interests',
      description: 'Share your hobbies and talk about free time activities',
      difficulty: 'beginner',
      imageUrl: '/images/scenarios/hobbies.jpg',
      exampleQuestions: [
        "What do you like to do in your free time?",
        "How long have you had this hobby?",
        "Why do you enjoy this activity?"
      ]
    },
    {
      id: 'coffee-shop',
      title: 'Coffee Shop Chat',
      description: 'Practice ordering and making small talk at a coffee shop',
      difficulty: 'beginner',
      imageUrl: '/images/scenarios/coffee-shop.jpg',
      exampleQuestions: [
        "Can I get a medium latte, please?",
        "What's your most popular drink?",
        "Do you have any food recommendations?"
      ]
    }
  ],
  intermediate: [
    {
      id: 'job-interview',
      title: 'Job Interview',
      description: 'Practice common job interview questions and responses',
      difficulty: 'intermediate',
      imageUrl: '/images/scenarios/job-interview.jpg',
      exampleQuestions: [
        "Tell me about yourself",
        "What are your strengths and weaknesses?",
        "Where do you see yourself in 5 years?"
      ]
    }
  ],
  advanced: [
    {
      id: 'business-negotiation',
      title: 'Business Negotiation',
      description: 'Practice negotiating deals and contracts in English',
      difficulty: 'advanced',
      imageUrl: '/images/scenarios/business-negotiation.jpg',
      exampleQuestions: [
        "Could we discuss the terms of the agreement?",
        "What's your best offer?",
        "Let's talk about the delivery timeline"
      ]
    }
  ]
};

interface ScenarioSelectorProps {
  selectedScenario: Scenario | null;
  onScenarioSelect: (scenario: Scenario) => void;
}

const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({
  selectedScenario,
  onScenarioSelect,
}) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);

  const difficultyLabels: Record<string, string> = {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced'
  };

  const difficultyStyles: Record<string, string> = {
    beginner: 'bg-green-100 text-green-800 border-green-200',
    intermediate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    advanced: 'bg-red-100 text-red-800 border-red-200'
  };

  // Get scenarios to display based on selected difficulty
  const getScenariosToDisplay = () => {
    if (selectedDifficulty) {
      return { [selectedDifficulty]: allScenarios[selectedDifficulty] };
    }
    return allScenarios;
  };

  const scenariosToDisplay = getScenariosToDisplay();

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      <h1 className="text-4xl font-bold text-center mb-8">English Conversation Practice</h1>
      
      {/* Difficulty selector */}
      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => setSelectedDifficulty(null)}
          className={`
            px-4 py-2 rounded-full border-2 transition-all
            ${!selectedDifficulty 
              ? 'bg-blue-100 text-blue-800 border-blue-200 font-semibold'
              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            }
          `}
        >
          All Levels
        </button>
        {Object.keys(difficultyLabels).map((difficulty) => (
          <button
            key={difficulty}
            onClick={() => setSelectedDifficulty(difficulty)}
            className={`
              px-4 py-2 rounded-full border-2 transition-all
              ${selectedDifficulty === difficulty 
                ? difficultyStyles[difficulty] + ' font-semibold'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }
            `}
          >
            {difficultyLabels[difficulty]}
          </button>
        ))}
      </div>

      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Choose a Scenario
      </h2>
      
      {/* Display scenario cards by difficulty level */}
      <div className="space-y-12">
        {Object.entries(scenariosToDisplay).map(([difficulty, scenarios]) => (
          <div key={difficulty} className="space-y-6">
            <div className="flex items-center space-x-3">
              <h3 className={`text-xl font-semibold px-4 py-1 rounded-full ${difficultyStyles[difficulty]}`}>
                {difficultyLabels[difficulty]}
              </h3>
              <div className="h-px bg-gray-200 flex-grow"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {scenarios.map((scenario) => (
                <ScenarioCard
                  key={scenario.id}
                  scenario={scenario}
                  isSelected={selectedScenario?.id === scenario.id}
                  onSelect={onScenarioSelect}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScenarioSelector; 