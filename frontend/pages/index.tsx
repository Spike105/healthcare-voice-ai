import React from 'react';
import AudioRecorder from '../components/AudioRecorder';

export default function Home() {
  const handleTranscription = (text: string) => {
    console.log('Transcribed:', text);
  };

  const handleLLMResponse = (response: string, type: string) => {
    console.log('AI Response:', response, 'Type:', type);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Healthcare Voice AI Assistant
        </h1>
        
        <AudioRecorder 
          onTranscription={handleTranscription}
          onLLMResponse={handleLLMResponse}
        />
        
        <div className="mt-8 text-center text-gray-600">
          <p>Speak naturally about your health concerns.</p>
          <p>The AI will provide helpful information and guidance.</p>
          <p className="mt-4 text-sm font-semibold text-red-600">
            This AI assistant is not a substitute for professional medical advice.
          </p>
        </div>
      </div>
    </div>
  );
}
