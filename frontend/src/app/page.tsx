'use client'

import { useState } from 'react'
import AudioRecorder from '@/components/audio/AudioRecorder'

export default function Home() {
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)

  const handleAudioReady = (blob: Blob) => {
    setAudioBlob(blob)
    console.log('Audio ready:', blob)
    alert(`Audio recorded! Size: ${(blob.size / 1024).toFixed(1)} KB`)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Healthcare Voice Assistant
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Record your health concerns and get AI-powered guidance and support
          </p>
        </div>

        {/* Audio Recorder */}
        <div className="max-w-2xl mx-auto">
          <AudioRecorder onAudioReady={handleAudioReady} />
        </div>

        {/* Instructions */}
        <div className="max-w-3xl mx-auto mt-12 p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">How it works:</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">
                1
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Record or Upload</h3>
              <p className="text-gray-600 text-sm">
                Use your microphone to record your health concern or upload an audio file
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">
                2
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">AI Analysis</h3>
              <p className="text-gray-600 text-sm">
                Our AI analyzes your audio and understands your health-related questions
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">
                3
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Get Guidance</h3>
              <p className="text-gray-600 text-sm">
                Receive helpful information and recommendations for your health concerns
              </p>
            </div>
          </div>
        </div>

        {/* Debug Info */}
        {audioBlob && (
          <div className="max-w-2xl mx-auto mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-medium">✅ Audio recorded successfully!</p>
            <p className="text-green-600 text-sm mt-1">
              Size: {(audioBlob.size / 1024).toFixed(1)} KB | 
              Type: {audioBlob.type}
            </p>
          </div>
        )}
      </div>
    </main>
  )
}