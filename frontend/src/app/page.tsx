'use client'

import { useState } from 'react'
import AudioRecorder from '@/components/audio/AudioRecorder'
import { Mic, FileText, Loader2 } from 'lucide-react'

export default function Home() {
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [transcription, setTranscription] = useState<string>('')
  const [isTranscribing, setIsTranscribing] = useState(false)

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

        <div className="max-w-4xl mx-auto grid lg:grid-cols-2 gap-8">
          {/* Left Column - Audio Input */}
          <div className="space-y-6">
            {/* Audio Recorder */}
            <div className="bg-white rounded-xl shadow-lg border p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Mic className="w-5 h-5 mr-2" />
                Voice Input
              </h2>
              <AudioRecorder 
                onAudioReady={handleAudioReady} 
                isLoading={isTranscribing}
              />
            </div>

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
          </div>

          {/* Right Column - Transcription Display */}
          <div className="bg-white rounded-xl shadow-lg border p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Transcription
            </h2>
            
            {transcription ? (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-wrap">{transcription}</p>
                </div>
                
                {/* Copy Button */}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(transcription)
                    alert('Transcription copied to clipboard!')
                  }}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Copy to Clipboard
                </button>
                
                {/* Download Button */}
                <button
                  onClick={() => {
                    const blob = new Blob([transcription], { type: 'text/plain' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = 'transcription.txt'
                    a.click()
                    URL.revokeObjectURL(url)
                  }}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Download as Text File
                </button>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">No transcription yet</p>
                <p className="text-sm">Record or upload audio to see the transcription here</p>
              </div>
            )}
            
            {isTranscribing && (
              <div className="flex items-center justify-center mt-4 text-blue-600">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                <span>Transcribing audio...</span>
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
              <h3 className="font-semibold text-gray-800 mb-2">AI Transcription</h3>
              <p className="text-gray-600 text-sm">
                Our AI converts your speech to text using advanced speech recognition
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">
                3
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Get Text</h3>
              <p className="text-gray-600 text-sm">
                View, copy, or download your transcribed text for further use
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