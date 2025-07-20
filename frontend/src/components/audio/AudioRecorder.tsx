'use client'

import { useState, useRef } from 'react'
import { Mic, Square, Upload, Play, Pause } from 'lucide-react'

interface AudioRecorderProps {
  onAudioReady: (audioBlob: Blob) => void
  isLoading?: boolean
}

export default function AudioRecorder({ onAudioReady, isLoading = false }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      })
      
      mediaRecorderRef.current = new MediaRecorder(stream)
      chunksRef.current = []
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' })
        const url = URL.createObjectURL(audioBlob)
        setAudioUrl(url)
        onAudioReady(audioBlob)
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
      }
      
      mediaRecorderRef.current.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Error starting recording:', error)
      alert('Error accessing microphone. Please allow microphone access.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type and size
      if (!file.type.startsWith('audio/')) {
        alert('Please upload an audio file')
        return
      }
      
      if (file.size > 20 * 1024 * 1024) { // 20MB limit
        alert('File size must be less than 20MB')
        return
      }
      
      const url = URL.createObjectURL(file)
      setAudioUrl(url)
      onAudioReady(file)
    }
  }

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg border">
      <h2 className="text-xl font-bold text-center mb-6 text-gray-800">Voice Input</h2>
      
      {/* Recording Controls */}
      <div className="flex justify-center space-x-4 mb-6">
        {!isRecording ? (
          <button
            onClick={startRecording}
            disabled={isLoading}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Mic className="w-5 h-5" />
            <span>Start Recording</span>
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors animate-pulse"
          >
            <Square className="w-5 h-5" />
            <span>Stop Recording</span>
          </button>
        )}
      </div>
      
      {/* File Upload */}
      <div className="mb-6">
        <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
          <Upload className="w-5 h-5 mr-2 text-gray-500" />
          <span className="text-gray-600">Upload Audio File</span>
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            disabled={isLoading}
            className="hidden"
          />
        </label>
      </div>
      
      {/* Audio Preview */}
      {audioUrl && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <button
              onClick={togglePlayback}
              className="bg-green-600 text-white p-2 rounded-full hover:bg-green-700 transition-colors"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <span className="text-sm text-gray-600">Audio Preview</span>
          </div>
          <audio
            ref={audioRef}
            src={audioUrl}
            onEnded={() => setIsPlaying(false)}
            className="w-full"
            controls
          />
        </div>
      )}
      
      {/* Recording Indicator */}
      {isRecording && (
        <div className="flex items-center justify-center space-x-2 text-red-600">
          <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
          <span className="font-medium">Recording...</span>
        </div>
      )}
      
      {/* Loading Indicator */}
      {isLoading && (
        <div className="flex items-center justify-center space-x-2 text-blue-600">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Processing...</span>
        </div>
      )}
    </div>
  )
}