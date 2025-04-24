'use client';

import React, { useState } from 'react';
import VideoInterface from './components/VideoChat/VideoInterface';
import ScenarioCard, { Scenario } from './components/ScenarioSelection/ScenarioCard';

const scenarios: Scenario[] = [
  {
    id: '1',
    title: 'Coffee Shop Chat',
    description: 'Practice ordering and making small talk at a coffee shop',
    difficulty: 'beginner',
    imageUrl: '/scenarios/coffee-shop.jpg',
  },
  {
    id: '2',
    title: 'Job Interview',
    description: 'Practice common job interview questions and responses',
    difficulty: 'intermediate',
    imageUrl: '/scenarios/job-interview.jpg',
  },
  {
    id: '3',
    title: 'Business Negotiation',
    description: 'Practice negotiating deals and contracts in English',
    difficulty: 'advanced',
    imageUrl: '/scenarios/business.jpg',
  },
];

export default function Home() {
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);

  const handleScenarioSelect = (scenario: Scenario) => {
    setSelectedScenario(scenario);
  };

  const handleSpeechStart = () => {
    console.log('Speech started');
    // Add speech handling logic
  };

  const handleSpeechEnd = () => {
    console.log('Speech ended');
    // Add speech handling logic
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">
          English Conversation Practice
        </h1>

        {selectedScenario ? (
          <div>
            <button
              onClick={() => setSelectedScenario(null)}
              className="mb-4 text-blue-600 hover:text-blue-800"
            >
              ← Back to Scenarios
            </button>
            <VideoInterface
              onSpeechStart={handleSpeechStart}
              onSpeechEnd={handleSpeechEnd}
              scenarioTitle={selectedScenario.title}
            />
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Choose a Scenario</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {scenarios.map((scenario) => (
                <ScenarioCard
                  key={scenario.id}
                  scenario={scenario}
                  onSelect={handleScenarioSelect}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
