import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square } from 'lucide-react';

interface AudioRecorderProps {
  onTranscription?: (text: string) => void;
  onLLMResponse?: (response: string, type: string) => void;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ 
  onTranscription, 
  onLLMResponse 
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleStartRecording = async () => {
    setError('');
    setTranscription('');
    setAiResponse('');
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await processAudio(audioBlob);
        
        // Stop all tracks to release the microphone
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setTranscription('Recording started...');
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError('Could not access microphone. Please check your browser permissions.');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsLoading(true);
    }
  };
  
  const processAudio = async (audioBlob: Blob) => {
    try {
      // Step 1: Send audio to STT service
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');
      
      const sttResponse = await fetch('http://localhost:5001/transcribe', {
        method: 'POST',
        body: formData,
      });
      
      if (!sttResponse.ok) {
        throw new Error(`STT service error: ${sttResponse.status}`);
      }
      
      const sttData = await sttResponse.json();
      const transcribedText = sttData.text;
      setTranscription(transcribedText);
      onTranscription?.(transcribedText);
      
      // Step 2: Send transcription to backend for LLM processing
      const llmResponse = await fetch('http://localhost:3001/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: transcribedText }),
      });
      
      if (!llmResponse.ok) {
        throw new Error(`Backend service error: ${llmResponse.status}`);
      }
      
      const llmData = await llmResponse.json();
      setAiResponse(llmData.response);
      onLLMResponse?.(llmData.response, llmData.type || 'health_guidance');
    } catch (err) {
      console.error('Error processing audio:', err);
      setError(`Error: ${err instanceof Error ? err.message : 'Unknown error occurred'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-4">Voice Assistant</h2>
        
        {!isRecording ? (
          <button
            onClick={handleStartRecording}
            className="flex items-center justify-center mx-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Mic className="w-5 h-5 mr-2" />
            Start Recording (Demo)
          </button>
        ) : (
          <button
            onClick={handleStopRecording}
            className="flex items-center justify-center mx-auto px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors animate-pulse"
          >
            <Square className="w-5 h-5 mr-2" />
            Stop Recording
          </button>
        )}
      </div>

      {transcription && (
        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">You said:</h3>
          <p className="text-gray-700">{transcription}</p>
        </div>
      )}

      {isLoading && (
        <div className="mb-4 p-4 bg-yellow-50 rounded-lg">
          <p className="text-yellow-800">AI is thinking...</p>
        </div>
      )}

      {aiResponse && (
        <div className="mb-4 p-4 bg-green-50 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-2">AI Assistant:</h3>
          <p className="text-gray-700">{aiResponse}</p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-50 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}
      
      <div className="text-xs text-gray-500 text-center mt-4">
        Connected to backend services
      </div>
    </div>
  );
};

export default AudioRecorder;
