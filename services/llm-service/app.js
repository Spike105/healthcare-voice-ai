const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5002;
const MEDGEMMA_MODEL = process.env.MEDGEMMA_MODEL || 'google/medgemma-2b';
const MAX_LENGTH = parseInt(process.env.MAX_LENGTH) || 512;
const TEMPERATURE = parseFloat(process.env.TEMPERATURE) || 0.7;

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
    model: MEDGEMMA_MODEL,
    engine: 'MedGemma',
    python_script: 'medgemma_inference.py'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Healthcare LLM Service API - MedGemma Edition',
    version: '2.0.0',
    endpoints: {
      health: '/health',
      chat: '/chat'
    },
    model: MEDGEMMA_MODEL,
    engine: 'MedGemma'
  });
});

// Function to call Python MedGemma inference
function callMedGemmaInference(prompt, maxLength = MAX_LENGTH, temperature = TEMPERATURE) {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(__dirname, 'medgemma_inference.py');
    const pythonProcess = spawn('python', [
      pythonScript,
      '--prompt', prompt,
      '--max_length', maxLength.toString(),
      '--temperature', temperature.toString()
    ]);

    let stdout = '';
    let stderr = '';

    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const result = JSON.parse(stdout.trim());
          resolve(result);
        } catch (parseError) {
          reject(new Error(`Failed to parse Python output: ${parseError.message}`));
        }
      } else {
        reject(new Error(`Python process exited with code ${code}: ${stderr}`));
      }
    });

    pythonProcess.on('error', (error) => {
      reject(new Error(`Failed to start Python process: ${error.message}`));
    });

    // Set timeout for long-running inference
    setTimeout(() => {
      pythonProcess.kill('SIGTERM');
      reject(new Error('MedGemma inference timeout'));
    }, 120000); // 120 second timeout
  });
}

// Chat endpoint
app.post('/chat', async (req, res) => {
  try {
    const { message, context, max_length, temperature } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    console.log(`MedGemma request: ${message.substring(0, 50)}...`);
    
    try {
      // Call MedGemma inference
      const inferenceResult = await callMedGemmaInference(
        message,
        max_length || MAX_LENGTH,
        temperature || TEMPERATURE
      );
      
      if (inferenceResult.success) {
        res.json({
          success: true,
          response: inferenceResult.response,
          type: 'medgemma',
          model: MEDGEMMA_MODEL,
          confidence: inferenceResult.confidence || 0.9,
          timestamp: new Date().toISOString()
        });
      } else {
        throw new Error(inferenceResult.error || 'MedGemma inference failed');
      }
    } catch (medgemmaError) {
      console.error('MedGemma inference error:', medgemmaError.message);
      
      // Fallback response
      res.json({
        success: true,
        response: `I apologize, but I'm currently unable to process your request about "${message}". As a healthcare AI assistant, I recommend consulting with a qualified healthcare professional for medical advice. Please ensure your environment is properly configured with the required dependencies and HF_TOKEN.`,
        type: 'fallback',
        confidence: 0.5,
        timestamp: new Date().toISOString(),
        error: medgemmaError.message
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

// Test endpoint for MedGemma setup
app.get('/test-setup', async (req, res) => {
  try {
    const testResult = await callMedGemmaInference(
      'What is a common symptom of the flu?',
      256,
      0.7
    );
    
    res.json({
      success: true,
      setup_status: 'working',
      test_result: testResult,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.json({
      success: false,
      setup_status: 'failed',
      error: error.message,
      timestamp: new Date().toISOString(),
      troubleshooting: {
        check_python: 'Ensure Python is installed and accessible',
        check_dependencies: 'Run: npm run install-python-deps',
        check_hf_token: 'Set HF_TOKEN in .env file',
        check_model: 'Verify MedGemma model access on Hugging Face'
      }
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Healthcare LLM Service (MedGemma) running on port ${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`💬 Chat endpoint: http://localhost:${PORT}/chat`);
  console.log(`🧪 Test setup: http://localhost:${PORT}/test-setup`);
  console.log(`\n🔧 Using MedGemma model: ${MEDGEMMA_MODEL}`);
  console.log(`⚙️ Max length: ${MAX_LENGTH}, Temperature: ${TEMPERATURE}`);
  console.log(`\n📝 Setup instructions:`);
  console.log(`   1. Set HF_TOKEN in .env file`);
  console.log(`   2. Run: npm run install-python-deps`);
  console.log(`   3. Test: curl http://localhost:${PORT}/test-setup`);
});

module.exports = app;