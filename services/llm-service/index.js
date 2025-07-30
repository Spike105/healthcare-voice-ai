const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5002;

// Ollama configuration
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'gemma3:1b';

// Middleware
app.use(cors());
app.use(express.json());

// Healthcare-specific prompts and responses
const healthcarePrompts = {
  greeting: "Hello! I'm your healthcare AI assistant. How can I help you today?",
  symptoms: "I can help you understand common symptoms, but please remember I'm not a substitute for professional medical advice. What symptoms are you experiencing?",
  medication: "I can provide general information about medications, but always consult with your healthcare provider for specific medical advice.",
  emergency: "If you're experiencing a medical emergency, please call emergency services immediately (911 in the US).",
  disclaimer: "I am an AI assistant and cannot provide medical diagnosis or treatment. Always consult with qualified healthcare professionals for medical advice."
};

// Healthcare system prompt for Llama 3
const HEALTHCARE_SYSTEM_PROMPT = `You are a helpful healthcare AI assistant. Your role is to:

1. Provide general health information and wellness advice
2. Help users understand common symptoms and when to seek medical attention
3. Offer guidance on healthy lifestyle choices
4. Recognize potential medical emergencies and direct users to appropriate care
5. Provide information about medications and treatments (but not prescriptions)

IMPORTANT DISCLAIMERS:
- You cannot provide medical diagnosis or treatment
- You are not a substitute for professional medical advice
- For medical emergencies, always direct users to call emergency services (911)
- Always recommend consulting with qualified healthcare professionals for specific medical concerns

Be helpful, informative, and always prioritize user safety.`;

// Function to call Ollama API
async function callOllama(prompt, context = '') {
  try {
    const fullPrompt = context ? `${context}\n\nUser: ${prompt}` : prompt;
    
    const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
      model: OLLAMA_MODEL,
      prompt: fullPrompt,
      system: HEALTHCARE_SYSTEM_PROMPT,
      stream: false,
      options: {
        temperature: 0.7,
        top_p: 0.9,
        max_tokens: 1000
      }
    }, {
      timeout: 30000 // 30 second timeout
    });

    return response.data.response;
  } catch (error) {
    console.error('Error calling Ollama:', error.message);
    throw new Error(`Ollama API error: ${error.message}`);
  }
}

// Enhanced healthcare response generator using Llama 3
async function generateHealthcareResponse(query, context = '') {
  try {
    // Call Llama 3 through Ollama with context
    const llmResponse = await callOllama(query, context);
    
    // Determine response type based on content
  const lowerQuery = query.toLowerCase();
    let type = 'general';
    let confidence = 0.7;
  
  if (lowerQuery.includes('emergency') || lowerQuery.includes('chest pain') || 
      lowerQuery.includes('difficulty breathing') || lowerQuery.includes('severe')) {
      type = 'emergency';
      confidence = 0.9;
    } else if (lowerQuery.includes('headache') || lowerQuery.includes('fever') || 
      lowerQuery.includes('cough') || lowerQuery.includes('pain')) {
      type = 'symptoms';
      confidence = 0.8;
    } else if (lowerQuery.includes('medication') || lowerQuery.includes('medicine') || 
               lowerQuery.includes('drug') || lowerQuery.includes('pill')) {
      type = 'medication';
      confidence = 0.8;
    } else if (lowerQuery.includes('health') || lowerQuery.includes('wellness') || 
               lowerQuery.includes('exercise') || lowerQuery.includes('diet')) {
      type = 'general_health';
      confidence = 0.7;
    }
    
    return {
      response: llmResponse,
      type: type,
      confidence: confidence
    };
  } catch (error) {
    console.error('Error generating healthcare response:', error);
    // Fallback to a safe response if LLM fails
  return {
    response: "I'm here to help with your healthcare questions. However, I cannot provide medical diagnosis or treatment. For specific medical concerns, please consult with a qualified healthcare professional. How can I assist you today?",
    type: "general",
    confidence: 0.5
  };
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'llm-service',
    timestamp: new Date().toISOString()
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
    
    console.log(`Received chat request: ${message}`);
    if (context) {
      console.log(`With context: ${context.substring(0, 100)}...`);
    }
    
    // Generate healthcare-focused response using Llama 3 with context
    const llmResponse = await generateHealthcareResponse(message, context);
    
    // Add healthcare disclaimer
    const response = {
      success: true,
      response: llmResponse.response,
      type: llmResponse.type,
      confidence: llmResponse.confidence,
      disclaimer: healthcarePrompts.disclaimer,
      timestamp: new Date().toISOString()
    };
    
    console.log(`Generated response: ${response.response.substring(0, 100)}...`);
    
    res.json(response);
    
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Get available models/info
app.get('/models', (req, res) => {
  res.json({
    available_models: ['gemma3:1b'],
    current_model: OLLAMA_MODEL,
    ollama_url: OLLAMA_URL,
    capabilities: [
      'General health information',
      'Symptom guidance',
      'Medication information',
      'Emergency recognition',
      'Wellness advice',
      'Natural language understanding',
      'Contextual responses'
    ],
    limitations: [
      'Cannot provide medical diagnosis',
      'Cannot prescribe medications',
      'Not a substitute for professional medical advice',
      'For emergencies, call 911',
      'Requires Ollama to be running'
    ]
  });
});

// Get healthcare prompts
app.get('/prompts', (req, res) => {
  res.json({
    prompts: healthcarePrompts,
    categories: Object.keys(healthcarePrompts)
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 LLM Service running on port ${PORT}`);
  console.log(`🤖 Using Ollama model: ${OLLAMA_MODEL}`);
  console.log(`🔗 Ollama URL: ${OLLAMA_URL}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`💬 Chat endpoint: http://localhost:${PORT}/chat`);
  console.log(`🔍 Models info: http://localhost:${PORT}/models`);
});

module.exports = app; 