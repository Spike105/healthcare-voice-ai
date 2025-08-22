import React from 'react';
import ChatBot from '../components/ChatBot';

export default function Home() {
  const handleTranscription = (text: string) => {
    console.log('Transcribed:', text);
  };

  const handleLLMResponse = (response: string, type: string) => {
    console.log('AI Response:', response, 'Type:', type);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Healthcare AI Assistant
          </h1>
          <p className="text-gray-600 mb-4">
            Your intelligent healthcare companion - speak, type, or upload audio
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 max-w-2xl mx-auto">
            <p className="text-sm font-semibold text-yellow-800">
              ⚠️ This AI assistant is for informational purposes only and is not a substitute for professional medical advice.
            </p>
          </div>
        </div>
        
        <ChatBot 
          onTranscription={handleTranscription}
          onLLMResponse={handleLLMResponse}
        />
        
        <div className="mt-6 text-center text-gray-500 text-sm">
          <p>💡 Tips: Use voice for natural conversation, type for quick questions, or upload audio files for analysis</p>
        </div>
      </div>
    </div>
  );
}
