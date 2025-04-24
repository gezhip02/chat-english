'use client';

import React, { useState } from 'react';
import VideoInterface from './components/VideoChat/VideoInterface';
import ScenarioSelector, { allScenarios } from './components/ScenarioSelector/ScenarioSelector';
import { Scenario } from './components/ScenarioCard/ScenarioCard';

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
              className="mb-4 text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              <span>Back to Scenarios</span>
            </button>
            <VideoInterface
              onSpeechStart={handleSpeechStart}
              onSpeechEnd={handleSpeechEnd}
              scenarioTitle={selectedScenario.title}
            />
          </div>
        ) : (
          <ScenarioSelector 
            selectedScenario={selectedScenario}
            onScenarioSelect={handleScenarioSelect}
          />
        )}
      </div>
    </main>
  );
}
