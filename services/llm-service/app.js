const express = require('express');
const cors = require('cors');
const axios = require('axios');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5002;
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'tinyllama:latest';

// Apply middleware
app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(morgan('dev'));
app.use(compression());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'healthcare-llm-service',
    timestamp: new Date().toISOString(),
    model: OLLAMA_MODEL,
    ollama_url: OLLAMA_URL
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Healthcare LLM Service API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      chat: '/chat'
    }
  });
});

// Chat endpoint
app.post('/chat', async (req, res) => {
  try {
    const { message, context } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    console.log(`LLM request: ${message.substring(0, 50)}...`);
    
    // Format the prompt with healthcare context
    const healthcarePrompt = `You are a healthcare AI assistant. Please provide helpful information about the following health question, while being clear that you're not a doctor and not providing medical advice: ${message}`;
    
    try {
      // Call Ollama API
      const ollamaResponse = await axios.post(`${OLLAMA_URL}/api/generate`, {
        model: OLLAMA_MODEL,
        prompt: healthcarePrompt,
        stream: false
      }, { timeout: 30000 });
      
      res.json({
        success: true,
        response: ollamaResponse.data.response,
        type: 'ollama',
        model: OLLAMA_MODEL,
        confidence: 0.9,
        timestamp: new Date().toISOString()
      });
    } catch (ollamaError) {
      console.error('Ollama API error:', ollamaError.message);
      
      // Fallback response
      res.json({
        success: true,
        response: `I apologize, but I'm currently unable to process your request about "${message}". As a healthcare AI assistant, I recommend consulting with a qualified healthcare professional for medical advice.`,
        type: 'fallback',
        confidence: 0.5,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error in chat endpoint:', error.message);
    res.status(500).json({
      success: false,
      error: 'Chat request failed',
      message: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Healthcare LLM Service running on port ${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`💬 Chat endpoint: http://localhost:${PORT}/chat`);
  console.log(`\n🔧 Using Ollama model: ${OLLAMA_MODEL}`);
  console.log(`🔗 Ollama URL: ${OLLAMA_URL}`);
});

module.exports = app;