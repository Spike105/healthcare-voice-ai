# Healthcare Voice AI - Complete Instructions

## 🏥 Project Overview
A comprehensive AI-powered voice assistant for healthcare built with Next.js, Node.js, Whisper STT (Tiny model), Gemma 3 1B LLM via Ollama, and modern web technologies.

## 🎯 Key Features
- **Voice-to-Text**: Real-time audio transcription using Whisper AI
- **AI Chat**: Intelligent healthcare conversations with Gemma 3 1B
- **Integrated Interface**: Voice recording and text input in one chat interface
- **Healthcare Focus**: Specialized prompts and safety disclaimers
- **Real-time Processing**: Instant transcription and AI responses

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18.0+ (recommended: v20+)
- **Python**: v3.8+ (for backend services)
- **Git**: Latest version
- **Ollama**: Latest version (for Llama 3 8B LLM)
- **FFmpeg**: Latest version (for audio processing)
- **Modern browser** with microphone support

### 1. Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd Healthcare-Voice-AI

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install

# Install LLM service dependencies
cd ../services/llm-service
npm install

# Install Python service dependencies
cd ../whisper-service
pip install -r requirements.txt

cd ../tts-service
pip install -r requirements.txt
```

### 2. Setup Ollama and Gemma 3 1B

```bash
# Install Ollama from https://ollama.ai/download

# Run the automated setup script
./setup-gemma.ps1

# Or manually download Gemma 3 1B
ollama pull gemma3:1b
```

### 3. Start All Services

```bash
# Option 1: Use the automated script
./start-all-services.ps1

# Option 2: Start services manually
# Terminal 1: Start Ollama
ollama serve

# Terminal 2: Start Whisper service
cd services/whisper-service && python main.py

# Terminal 3: Start LLM service
cd services/llm-service && npm start

# Terminal 4: Start Backend
cd backend && npm start

# Terminal 5: Start Frontend
cd frontend && npm run dev
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Whisper Service**: http://localhost:5001
- **LLM Service**: http://localhost:5002
- **Ollama API**: http://localhost:11434

## 📁 Project Structure

```
healthcare-voice-ai/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/             # App router pages
│   │   ├── components/      # React components
│   │   │   ├── audio/       # Audio-related components
│   │   │   └── ui/          # UI components
│   │   ├── lib/             # Utility functions
│   │   ├── types/           # TypeScript type definitions
│   │   └── hooks/           # Custom React hooks
│   ├── public/              # Static assets
│   ├── package.json         # Frontend dependencies
│   └── tailwind.config.js   # Tailwind configuration
├── backend/                  # Node.js API gateway
│   ├── index.js             # Main server file (20MB file upload limit)
│   ├── routes/              # API routes
│   └── package.json         # Backend dependencies
├── services/
│   ├── whisper-service/     # STT service (Python/FastAPI + Tiny Whisper model)
│   ├── llm-service/         # LLM service (Node.js + Gemma 3 1B via Ollama)
│   └── tts-service/         # TTS service (Python/FastAPI)
├── testing/                 # Test files and audio samples
│   ├── harvard.wav          # Sample audio file for testing
│   └── test-*.ps1           # Test scripts
├── scripts/                 # Automation scripts
│   ├── setup-gemma.ps1      # Gemma 3 1B setup script
│   ├── quick-test-whisper.ps1 # Whisper service testing
│   ├── start-all-services.ps1 # Service startup automation
│   └── check-services.ps1   # Service health checks
├── docs/                    # Documentation
├── docker-compose.yml       # Docker deployment
└── README.md               # Project overview
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Service URLs
WHISPER_SERVICE_URL=http://localhost:5001
LLM_SERVICE_URL=http://localhost:5002
TTS_SERVICE_URL=http://localhost:5003

# Ollama Configuration
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=gemma3:1b

# Database (future feature)
DATABASE_URL=postgresql://user:password@localhost:5432/healthcare_ai

# Authentication (future feature)
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

## 🧪 Testing

### Service Health Checks
```bash
# Check all services status
./check-services.ps1

# Test individual services
curl -X GET http://localhost:5001/health  # Whisper (Tiny model)
curl -X GET http://localhost:5002/health  # LLM (Llama 3 8B)
curl -X GET http://localhost:5003/health  # TTS
```

### Whisper Testing
```bash
# Test Whisper transcription
./quick-test-whisper.ps1

# Test with specific audio file
curl -X POST http://localhost:5001/transcribe -F "file=@testing/harvard.wav"
```

### LLM Testing
```bash
# Test LLM chat
curl -X POST http://localhost:5002/chat -H "Content-Type: application/json" -d '{"message": "What are the symptoms of a headache?"}'

# Test Ollama directly
curl -X POST http://localhost:11434/api/generate -H "Content-Type: application/json" -d '{"model": "gemma3:1b", "prompt": "Hello"}'
```

## 🎮 Usage Instructions

### Using the Voice Assistant

1. **Open the Application**
   - Navigate to http://localhost:3000
   - Allow microphone permissions when prompted

2. **Voice Input**
   - Click the microphone button (🎤) in the chat input area
   - Speak your health question or concern
   - Click the stop button (⬛) to end recording
   - The audio will automatically transcribe and send to the AI

3. **Text Input**
   - Type your question directly in the text input field
   - Press Enter or click the send button (➤)

4. **AI Responses**
   - The AI will provide healthcare-focused responses
   - Responses include appropriate medical disclaimers
   - Continue the conversation with follow-up questions

### Features Available

- **Voice Recording**: Real-time audio capture and transcription
- **Text Chat**: Direct text input for questions
- **Healthcare Focus**: Specialized medical knowledge and safety warnings
- **Conversation History**: View previous messages with timestamps
- **Error Handling**: Graceful fallbacks for service issues

## 🔍 Troubleshooting

### Common Issues

#### Service Not Starting
```bash
# Check if ports are in use
netstat -ano | findstr :3000
netstat -ano | findstr :3001
netstat -ano | findstr :5001
netstat -ano | findstr :5002

# Kill processes if needed
taskkill /PID <process_id> /F
```

#### Ollama Issues
```bash
# Check Ollama installation
ollama --version

# Check if model is downloaded
ollama list

# Restart Ollama service
ollama serve
```

#### Audio Recording Issues
- **Browser Permissions**: Allow microphone access
- **HTTPS Required**: Some browsers require HTTPS for microphone access
- **Browser Support**: Use Chrome, Firefox, or Edge

#### Whisper Model Issues
```bash
# Check if FFmpeg is installed
ffmpeg -version

# Reinstall Whisper dependencies
cd services/whisper-service
pip install --force-reinstall -r requirements.txt
```

### Performance Optimization

- **Audio Quality**: Use 16kHz sample rate for faster processing
- **Model Size**: Using Tiny Whisper model for speed
- **Memory Usage**: Ensure sufficient RAM for Llama 3 8B (~8GB recommended)

## 📊 System Requirements

### Minimum Requirements
- **RAM**: 8GB (16GB recommended)
- **Storage**: 15GB free space (for models)
- **CPU**: Dual-core 2.0GHz+
- **Network**: Broadband internet for initial setup

### Recommended Specifications
- **RAM**: 8GB+ (for Gemma 3 1B + Tiny Whisper model)
- **Storage**: 20GB+ SSD (for models and audio files)
- **CPU**: Quad-core 2.0GHz+
- **GPU**: NVIDIA GPU for faster LLM inference (optional)

### Model Storage Requirements
- **Gemma 3 1B**: ~815MB
- **Whisper Tiny**: ~39MB
- **Total**: ~854MB for models

## 🚀 Deployment

### Development
```bash
# Start all services for development
./start-all-services.ps1
```

### Production
```bash
# Build frontend
cd frontend
npm run build

# Use PM2 for production process management
npm install -g pm2
pm2 start ecosystem.config.js
```

### Docker Deployment
```bash
# Build and start all services
docker-compose up --build

# Production deployment
docker-compose -f docker-compose.prod.yml up
```

## 🔒 Security Considerations

- **Medical Disclaimers**: AI responses include appropriate warnings
- **No Medical Diagnosis**: System explicitly states it cannot provide diagnosis
- **Emergency Recognition**: System directs users to emergency services when needed
- **Data Privacy**: Audio files are processed locally and not stored permanently

## 📞 Support

### Team Contacts
- **Frontend Issues**: Satya Krishna
- **STT Issues**: Shikhar  
- **LLM Issues**: Vamshi
- **TTS Issues**: Adithya

### Resources
- **Next.js Documentation**: https://nextjs.org/docs
- **Whisper Documentation**: https://github.com/openai/whisper
- **Ollama Documentation**: https://ollama.ai/docs
- **Gemma Documentation**: https://ai.google.dev/gemma
- **FastAPI Documentation**: https://fastapi.tiangolo.com

## 📝 Development Notes

### Recent Updates
- **Integrated Voice Input**: Recording button in chat interface
- **Tiny Whisper Model**: Faster processing with good accuracy
- **Gemma 3 1B Integration**: Real AI responses via Ollama
- **20MB File Upload**: Increased audio file size limit
- **Automated Setup**: PowerShell scripts for easy deployment

### Architecture
- **Microservices**: Separate services for STT, LLM, and TTS
- **API Gateway**: Backend handles routing and file uploads
- **Real-time Processing**: Immediate transcription and response
- **Error Handling**: Graceful fallbacks and user feedback

---

**Built with ❤️ by the Healthcare AI Team**

*This system is for educational and demonstration purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment.* 