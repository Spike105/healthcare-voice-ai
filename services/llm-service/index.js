const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5002;

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

// Mock LLM responses for healthcare queries
const generateHealthcareResponse = (query) => {
  const lowerQuery = query.toLowerCase();
  
  // Emergency keywords
  if (lowerQuery.includes('emergency') || lowerQuery.includes('chest pain') || 
      lowerQuery.includes('difficulty breathing') || lowerQuery.includes('severe')) {
    return {
      response: "This sounds like it could be a medical emergency. Please call emergency services (911) immediately and seek immediate medical attention.",
      type: "emergency",
      confidence: 0.9
    };
  }
  
  // Symptom-related queries
  if (lowerQuery.includes('headache') || lowerQuery.includes('fever') || 
      lowerQuery.includes('cough') || lowerQuery.includes('pain')) {
    return {
      response: `I understand you're asking about ${lowerQuery.includes('headache') ? 'headaches' : 
                 lowerQuery.includes('fever') ? 'fever' : 
                 lowerQuery.includes('cough') ? 'coughing' : 'pain'}. While I can provide general information, it's important to consult with a healthcare provider for proper diagnosis and treatment. Would you like me to provide some general information about when to seek medical attention?`,
      type: "symptoms",
      confidence: 0.7
    };
  }
  
  // Medication queries
  if (lowerQuery.includes('medication') || lowerQuery.includes('medicine') || 
      lowerQuery.includes('drug') || lowerQuery.includes('pill')) {
    return {
      response: "I can provide general information about medications, but for specific medical advice about your medications, please consult with your doctor or pharmacist. They can provide personalized guidance based on your medical history and current health status.",
      type: "medication",
      confidence: 0.8
    };
  }
  
  // General health queries
  if (lowerQuery.includes('health') || lowerQuery.includes('wellness') || 
      lowerQuery.includes('exercise') || lowerQuery.includes('diet')) {
    return {
      response: "I'm happy to provide general health and wellness information! Maintaining a healthy lifestyle with regular exercise, balanced nutrition, and adequate sleep is important for overall well-being. What specific aspect of health would you like to know more about?",
      type: "general_health",
      confidence: 0.6
    };
  }
  
  // Default response
  return {
    response: "I'm here to help with your healthcare questions. However, I cannot provide medical diagnosis or treatment. For specific medical concerns, please consult with a qualified healthcare professional. How can I assist you today?",
    type: "general",
    confidence: 0.5
  };
};

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
    
    // Generate healthcare-focused response
    const llmResponse = generateHealthcareResponse(message);
    
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
    available_models: ['healthcare-ai-v1'],
    current_model: 'healthcare-ai-v1',
    capabilities: [
      'General health information',
      'Symptom guidance',
      'Medication information',
      'Emergency recognition',
      'Wellness advice'
    ],
    limitations: [
      'Cannot provide medical diagnosis',
      'Cannot prescribe medications',
      'Not a substitute for professional medical advice',
      'For emergencies, call 911'
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
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`💬 Chat endpoint: http://localhost:${PORT}/chat`);
  console.log(`🔍 Models info: http://localhost:${PORT}/models`);
});

module.exports = app; 