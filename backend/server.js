const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Service URLs
const STT_SERVICE_URL = process.env.STT_SERVICE_URL || 'http://localhost:5001';
const TTS_SERVICE_URL = process.env.TTS_SERVICE_URL || 'http://localhost:5003';
const LLM_SERVICE_URL = process.env.LLM_SERVICE_URL || 'http://localhost:5002';

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'healthcare-voice-ai-backend',
    timestamp: new Date().toISOString(),
    services: {
      stt: STT_SERVICE_URL,
      tts: TTS_SERVICE_URL,
      llm: LLM_SERVICE_URL
    }
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Healthcare Voice AI Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      transcribe: '/api/transcribe',
      chat: '/api/chat',
      speak: '/api/speak',
      status: '/api/services/status'
    }
  });
});

// Transcribe audio endpoint
app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No audio file provided'
      });
    }

    console.log(`Received audio file: ${req.file.originalname}, size: ${req.file.size} bytes`);

    // For now, return a mock response
    // TODO: Integrate with actual STT service
    res.json({
      success: true,
      transcription: 'Mock transcription: Hello, how can I help with your health concerns today?',
      timestamp: new Date().toISOString(),
      fileSize: req.file.size,
      fileName: req.file.originalname
    });

  } catch (error) {
    console.error('Error in transcribe endpoint:', error.message);
    res.status(500).json({
      success: false,
      error: 'Transcription failed',
      message: error.message
    });
  }
});

// Chat endpoint (proxy to LLM service)
app.post('/api/chat', async (req, res) => {
  try {
    const { message, context } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    console.log(`Chat request: ${message}`);

    try {
      // Try to forward to LLM service
      const llmResponse = await axios.post(`${LLM_SERVICE_URL}/chat`, {
        message,
        context
      }, { timeout: 10000 });

      res.json(llmResponse.data);
    } catch (llmError) {
      console.log('LLM service not available, using fallback response');
      // Fallback response
      res.json({
        success: true,
        response: `Thank you for your message: "${message}". I'm a healthcare AI assistant. For proper medical advice, please consult with qualified healthcare professionals.`,
        type: 'fallback',
        confidence: 0.5,
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Chat request failed',
      message: error.message
    });
  }
});

// Text-to-speech endpoint
app.post('/api/speak', async (req, res) => {
  try {
    const { text, voice = 'default', language = 'en' } = req.body;
    
    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text is required'
      });
    }

    console.log(`TTS request: ${text.substring(0, 30)}...`);

    try {
      // Try to forward to TTS service
      const ttsResponse = await axios.post(`${TTS_SERVICE_URL}/speak`, {
        text,
        voice,
        language
      }, { timeout: 10000 });

      res.json({
        success: true,
        message: 'TTS request processed',
        audioUrl: '/api/audio/temp.mp3' // Mock URL
      });
    } catch (ttsError) {
      console.log('TTS service not available, using fallback response');
      res.json({
        success: true,
        message: 'TTS service not available - text received successfully',
        text: text
      });
    }

  } catch (error) {
    console.error('Error in speak endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'TTS request failed',
      message: error.message
    });
  }
});

// Service status endpoint
app.get('/api/services/status', async (req, res) => {
  const services = [
    { name: 'stt', url: STT_SERVICE_URL },
    { name: 'tts', url: TTS_SERVICE_URL },
    { name: 'llm', url: LLM_SERVICE_URL }
  ];

  const status = {};

  for (const service of services) {
    try {
      const response = await axios.get(`${service.url}/health`, { timeout: 5000 });
      status[service.name] = {
        status: 'healthy',
        url: service.url,
        response: response.data
      };
    } catch (error) {
      status[service.name] = {
        status: 'unhealthy',
        url: service.url,
        error: error.message
      };
    }
  }

  res.json({
    success: true,
    services: status,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Healthcare Voice AI Backend running on port ${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 Service status: http://localhost:${PORT}/api/services/status`);
  console.log(`📱 API endpoints available at http://localhost:${PORT}`);
  
  console.log('\\n🔧 Service URLs:');
  console.log(`   - STT Service: ${STT_SERVICE_URL}`);
  console.log(`   - TTS Service: ${TTS_SERVICE_URL}`);
  console.log(`   - LLM Service: ${LLM_SERVICE_URL}`);
});

module.exports = app;
