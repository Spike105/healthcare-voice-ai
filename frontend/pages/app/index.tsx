'use client'

import { useState, useRef, useEffect } from 'react'
import { Mic, FileText, Loader2, MessageCircle, Send, Bot, User, Square, Upload } from 'lucide-react'

export default function Home() {
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [transcription, setTranscription] = useState<string>('')
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [chatMessages, setChatMessages] = useState<Array<{type: 'user' | 'bot', message: string, timestamp: Date}>>([])
  const [isChatLoading, setIsChatLoading] = useState(false)
  const [userInput, setUserInput] = useState<string>('')
  const [isRecording, setIsRecording] = useState(false)
  const [mediaSupported, setMediaSupported] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAudioReady = async (blob: Blob) => {
    setAudioBlob(blob)
    console.log('Audio ready:', blob)
    
    // Automatically transcribe the audio
    await transcribeAudio(blob)
  }

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true)
    try {
      console.log('Audio blob info:', {
        size: audioBlob.size,
        type: audioBlob.type,
        lastModified: new Date().toISOString()
      })

      const formData = new FormData()
      formData.append('audio', audioBlob, `recording.${audioBlob.type.split('/')[1] || 'wav'}`)

      const response = await fetch('http://localhost:3001/api/transcribe', {
        method: 'POST',
        body: formData,
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Response error:', errorText)
        throw new Error(`Transcription failed: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log('Response data:', data)
      
      if (data.success) {
        setTranscription(data.transcription)
        // Automatically send transcription to LLM for response
        await sendToLLM(data.transcription)
      } else {
        throw new Error(data.error || 'Transcription failed')
      }
    } catch (error) {
      console.error('Transcription error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      alert(`Failed to transcribe audio: ${errorMessage}`)
    } finally {
      setIsTranscribing(false)
    }
  }

  const sendToLLM = async (message: string) => {
    setIsChatLoading(true)
    try {
      // Add user message to chat
      const userMessage = { type: 'user' as const, message, timestamp: new Date() }
      setChatMessages(prev => [...prev, userMessage])

      // Build conversation context from previous messages
      const conversationContext = chatMessages
        .slice(-6) // Keep last 6 messages for context
        .map(msg => `${msg.type === 'user' ? 'User' : 'Assistant'}: ${msg.message}`)
        .join('\n');

      const response = await fetch('http://localhost:5002/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message,
          context: conversationContext 
        }),
      })

      if (!response.ok) {
        throw new Error(`LLM request failed: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        // Add bot response to chat
        const botMessage = { type: 'bot' as const, message: data.response, timestamp: new Date() }
        setChatMessages(prev => [...prev, botMessage])
      } else {
        throw new Error(data.error || 'LLM response failed')
      }
    } catch (error) {
      console.error('LLM error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      const botMessage = { 
        type: 'bot' as const, 
        message: `Sorry, I encountered an error: ${errorMessage}`, 
        timestamp: new Date() 
      }
      setChatMessages(prev => [...prev, botMessage])
    } finally {
      setIsChatLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!userInput.trim()) return
    await sendToLLM(userInput.trim())
    setUserInput('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Check if media devices are supported in the browser
  useEffect(() => {
    const checkMediaSupport = async () => {
      if (typeof window !== "undefined") {
        try {
          await navigator.mediaDevices?.getUserMedia({ audio: true });
          setMediaSupported(true);
        } catch (error) {
          console.warn("getUserMedia is not supported in this environment.", error);
          setMediaSupported(false);
        }
      } else {
        setMediaSupported(false);
      }
    };
    
    checkMediaSupport();
  }, [])

  const startRecording = async () => {
    if (typeof window === "undefined") {
      console.error("Cannot access media devices on server side")
      alert("Audio recording is not available in this environment.")
      return
    }

    if (!mediaSupported) {
      alert("Audio recording is not supported in this browser. Please use a modern browser with microphone support.")
      return
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      alert("Microphone access is not available. Please check your browser permissions.")
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
          channelCount: 1
        }
      })
      
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm') 
        ? 'audio/webm' 
        : MediaRecorder.isTypeSupported('audio/mp4') 
        ? 'audio/mp4'
        : 'audio/wav'
      
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType })
      chunksRef.current = []
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: mimeType })
        setAudioBlob(audioBlob)
        transcribeAudio(audioBlob)
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
      }
      
      mediaRecorderRef.current.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Error starting recording:', error)
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          alert('Microphone access denied. Please allow microphone access in your browser settings.')
        } else if (error.name === 'NotFoundError') {
          alert('No microphone found. Please connect a microphone and try again.')
        } else {
          alert(`Error accessing microphone: ${error.message}`)
        }
      } else {
        alert('Error accessing microphone. Please check your browser permissions.')
      }
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check if file is audio
    if (!file.type.startsWith('audio/')) {
      alert('Please select an audio file')
      return
    }

    // Check file size (20MB limit)
    if (file.size > 20 * 1024 * 1024) {
      alert('File size must be less than 20MB')
      return
    }

    setIsUploading(true)
    try {
      // Convert file to blob and transcribe
      const blob = new Blob([file], { type: file.type })
      await transcribeAudio(blob)
    } catch (error) {
      console.error('File upload error:', error)
      alert('Failed to process audio file')
    } finally {
      setIsUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const triggerFileUpload = () => {
    fileInputRef.current?.click()
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Healthcare Voice Assistant
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Record your health concerns and convert them to text
          </p>
        </div>

        <div className="max-w-7xl mx-auto space-y-8">
          {/* Top Section - AI Chat (Full Width) */}
          <div className="bg-white rounded-xl shadow-lg border p-6 flex flex-col h-[600px]">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <MessageCircle className="w-5 h-5 mr-2" />
              AI Healthcare Assistant
            </h2>
            
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-2">
              {chatMessages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <Bot className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">Start a conversation by recording audio or typing a message</p>
                </div>
              ) : (
                chatMessages.map((msg, index) => (
                  <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-lg ${
                      msg.type === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      <div className="flex items-center mb-1">
                        {msg.type === 'user' ? (
                          <User className="w-4 h-4 mr-2" />
                        ) : (
                          <Bot className="w-4 h-4 mr-2" />
                        )}
                        <span className="text-xs opacity-75">
                          {msg.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                    </div>
                  </div>
                ))
              )}
              
              {isUploading && !isTranscribing && !isChatLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <div className="flex items-center">
                      <Bot className="w-4 h-4 mr-2" />
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm text-gray-600 ml-2">Uploading and processing audio file...</span>
                    </div>
                  </div>
                </div>
              )}
              
              {isTranscribing && !isChatLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <div className="flex items-center">
                      <Bot className="w-4 h-4 mr-2" />
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm text-gray-600 ml-2">Processing your audio...</span>
                    </div>
                  </div>
                </div>
              )}
              
              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <div className="flex items-center">
                      <Bot className="w-4 h-4 mr-2" />
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm text-gray-600 ml-2">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="border-t pt-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your health question..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  disabled={isChatLoading || isRecording || isUploading}
                />
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isChatLoading || !mediaSupported || isUploading}
                  className={`px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    isRecording 
                      ? 'bg-red-600 text-white hover:bg-red-700' 
                      : 'bg-gray-600 text-white hover:bg-gray-700'
                  }`}
                >
                  {isRecording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
                <button
                  onClick={triggerFileUpload}
                  disabled={isChatLoading || isRecording || isUploading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Upload audio file"
                >
                  <Upload className="w-4 h-4" />
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={isChatLoading || !userInput.trim() || isRecording || isUploading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Bottom Section - Audio Info & Status */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Audio Info */}
            {audioBlob && (
              <div className="bg-white rounded-xl shadow-lg border p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Audio Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">
                    <strong>Size:</strong> {(audioBlob.size / 1024).toFixed(1)} KB
                  </p>
                  <p className="text-gray-700">
                    <strong>Type:</strong> {audioBlob.type || 'audio/wav'}
                  </p>
                  <p className="text-gray-700">
                    <strong>Status:</strong> 
                    {isTranscribing ? (
                      <span className="text-blue-600 ml-2">Transcribing...</span>
                    ) : (
                      <span className="text-green-600 ml-2">Ready</span>
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* Transcription Status */}
            {isTranscribing && (
              <div className="bg-white rounded-xl shadow-lg border p-6">
                <div className="flex items-center justify-center text-blue-600">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  <span>Transcribing audio...</span>
                </div>
              </div>
            )}

            {/* Recording Status */}
            {isRecording && (
              <div className="bg-white rounded-xl shadow-lg border p-6">
                <div className="flex items-center justify-center text-red-600">
                  <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse mr-2"></div>
                  <span>Recording...</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="max-w-3xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">How it works:</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">
                1
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Record or Upload</h3>
              <p className="text-gray-600 text-sm">
                Use your microphone or upload an audio file with your health concern
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">
                2
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">AI Processing</h3>
              <p className="text-gray-600 text-sm">
                Our AI transcribes your speech and provides intelligent healthcare advice
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">
                3
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Chat & Learn</h3>
              <p className="text-gray-600 text-sm">
                Continue the conversation or ask follow-up questions via text or voice
              </p>
            </div>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="max-w-2xl mx-auto mt-6 flex justify-center">
          {isTranscribing && (
            <div className="flex items-center text-blue-600 bg-blue-50 px-4 py-2 rounded-lg">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              <span>Transcribing audio...</span>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}