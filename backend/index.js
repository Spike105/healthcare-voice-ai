const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Service URLs
const WHISPER_SERVICE_URL = process.env.WHISPER_SERVICE_URL || 'http://localhost:5001';

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'), false);
    }
  },
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'healthcare-voice-ai-backend',
    timestamp: new Date().toISOString(),
    services: {
      whisper: WHISPER_SERVICE_URL
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

    console.log(`Transcribing audio file: ${req.file.originalname}`);

    // Create form data for Whisper service
    const FormData = require('form-data');
    const formData = new FormData();
    formData.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });

    // Send to Whisper service
    const whisperResponse = await axios.post(
      `${WHISPER_SERVICE_URL}/transcribe`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
        timeout: 30000, // 30 second timeout
      }
    );

    res.json(whisperResponse.data);

  } catch (error) {
    console.error('Error in transcribe endpoint:', error.message);
    res.status(500).json({
      success: false,
      error: 'Transcription failed',
      message: error.message
    });
  }
});

// Service status endpoint
app.get('/api/services/status', async (req, res) => {
  try {
    const services = [
      { name: 'whisper', url: WHISPER_SERVICE_URL }
    ];

    const status = {};

    for (const service of services) {
      try {
        const response = await axios.get(`${service.url}/health`, { timeout: 5000 });
        status[service.name] = {
          status: 'healthy',
          response: response.data
        };
      } catch (error) {
        status[service.name] = {
          status: 'unhealthy',
          error: error.message
        };
      }
    }

    res.json({
      success: true,
      services: status,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to check service status',
      message: error.message
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: error.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Healthcare Voice AI Backend running on port ${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`🎤 Transcribe: http://localhost:${PORT}/api/transcribe`);
  console.log(`🔍 Service Status: http://localhost:${PORT}/api/services/status`);
});

module.exports = app; 