import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Upload, Send, User, Bot, FileAudio } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  isAudio?: boolean;
}

interface ChatBotProps {
  onTranscription?: (text: string) => void;
  onLLMResponse?: (response: string, type: string) => void;
}

const ChatBot: React.FC<ChatBotProps> = ({ 
  onTranscription, 
  onLLMResponse 
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [textInput, setTextInput] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (type: 'user' | 'bot', content: string, isAudio: boolean = false) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
      isAudio
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  };

  const handleStartRecording = async () => {
    setError('');
    
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
        await processAudio(audioBlob, true);
        
        // Stop all tracks to release the microphone
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      addMessage('user', 'Recording...', true);
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      setError('Please select an audio file.');
      return;
    }

    setError('');
    addMessage('user', `Uploaded: ${file.name}`, true);
    setIsLoading(true);
    await processAudio(file, false);
  };

  const handleTextSubmit = async () => {
    if (!textInput.trim()) return;

    const userMessage = textInput.trim();
    setTextInput('');
    addMessage('user', userMessage);
    setIsLoading(true);

    try {
      // Send text directly to LLM service
      const response = await fetch('http://localhost:5002/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: userMessage,
          context: 'text_input'
        }),
      });

      if (!response.ok) {
        throw new Error(`LLM service error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.response) {
        addMessage('bot', data.response);
        onLLMResponse?.(data.response, 'text_input');
      } else {
        addMessage('bot', 'I received your message but couldn\'t process it properly. Please try again.');
      }
    } catch (err) {
      console.error('Error processing text:', err);
      setError(`Error: ${err instanceof Error ? err.message : 'Unknown error occurred'}`);
      addMessage('bot', 'Sorry, I encountered an error processing your message.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const processAudio = async (audioBlob: Blob, isRecording: boolean) => {
    try {
      // Send audio to STT service (now includes LLM integration)
      const formData = new FormData();
      formData.append('audio', audioBlob, isRecording ? 'recording.wav' : 'upload.wav');
      
      const sttResponse = await fetch('http://localhost:5001/transcribe', {
        method: 'POST',
        body: formData,
      });
      
      if (!sttResponse.ok) {
        throw new Error(`STT service error: ${sttResponse.status}`);
      }
      
      const sttData = await sttResponse.json();
      const transcribedText = sttData.text;
      
      // Update the last user message with transcription
      if (isRecording) {
        setMessages(prev => {
          const updated = [...prev];
          const lastMessage = updated[updated.length - 1];
          if (lastMessage && lastMessage.type === 'user' && lastMessage.isAudio) {
            lastMessage.content = transcribedText || 'No speech detected';
          }
          return updated;
        });
      } else {
        // For file uploads, add transcription as new message
        addMessage('user', transcribedText || 'No speech detected');
      }
      
      onTranscription?.(transcribedText);
      
      // Handle LLM response from STT service
      if (sttData.llm_response && sttData.llm_response.success) {
        addMessage('bot', sttData.llm_response.response);
        onLLMResponse?.(sttData.llm_response.response, 'audio_input');
      } else if (sttData.llm_response && !sttData.llm_response.success) {
        addMessage('bot', `I heard you, but encountered an issue: ${sttData.llm_response.error}`);
      } else {
        addMessage('bot', 'I heard you, but couldn\'t generate a response. Please try again.');
      }
    } catch (err) {
      console.error('Error processing audio:', err);
      setError(`Error: ${err instanceof Error ? err.message : 'Unknown error occurred'}`);
      addMessage('bot', 'Sorry, I encountered an error processing your audio.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-4xl mx-auto h-[600px] bg-white rounded-lg shadow-lg flex flex-col">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 rounded-t-lg">
        <h2 className="text-xl font-semibold flex items-center">
          <Bot className="w-6 h-6 mr-2" />
          Healthcare AI Assistant
        </h2>
        <p className="text-blue-100 text-sm mt-1">Ask me about your health concerns</p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <Bot className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Hello! I'm your healthcare AI assistant.</p>
            <p className="text-sm mt-2">You can speak to me, upload an audio file, or type your questions.</p>
          </div>
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              <div className="flex items-start space-x-2">
                {message.type === 'user' ? (
                  <User className="w-4 h-4 mt-1 flex-shrink-0" />
                ) : (
                  <Bot className="w-4 h-4 mt-1 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className="text-sm">{message.content}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs opacity-70">
                      {formatTime(message.timestamp)}
                    </span>
                    {message.isAudio && (
                      <FileAudio className="w-3 h-3 opacity-70" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <Bot className="w-4 h-4" />
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-4 mb-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t p-4">
        <div className="flex items-center space-x-2">
          {/* Text Input */}
          <div className="flex-1 flex">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleTextSubmit()}
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              onClick={handleTextSubmit}
              disabled={!textInput.trim() || isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          {/* Voice Recording */}
          {!isRecording ? (
            <button
              onClick={handleStartRecording}
              disabled={isLoading}
              className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Start voice recording"
            >
              <Mic className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleStopRecording}
              className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 animate-pulse"
              title="Stop recording"
            >
              <Square className="w-5 h-5" />
            </button>
          )}

          {/* File Upload */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Upload audio file"
          >
            <Upload className="w-5 h-5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
        
        <div className="text-xs text-gray-500 text-center mt-2">
          💬 Type • 🎤 Record • 📁 Upload Audio • Connected to AI services
        </div>
      </div>
    </div>
  );
};

export default ChatBot;