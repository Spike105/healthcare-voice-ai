# Healthcare Voice AI Assistant

## 🏥 Project Overview
An AI-powered voice assistant for healthcare built with Next.js, Node.js, Whisper STT, local LLM, and open-source TTS.

## 👥 Team Members
- **Satya Krishna** - Frontend Lead (Next.js, Audio Recording)
- **Shikhar** - Whisper STT  (Speech-to-Text)
- **Vamshi** - LLM Integration (Ollama, Healthcare Prompts)
- **Adithya** - TTS Integration (Text-to-Speech)

## 🚀 Quick Start

### Prerequisites
- **Node.js**: v18.0+ (recommended: v20+)
- **Python**: v3.8+ (for backend services)
- **Git**: Latest version
- **Modern browser** with microphone support

### Installation
```bash
# 1. Clone the repository
git clone https://github.com/YOUR-USERNAME/healthcare-voice-ai.git
cd healthcare-voice-ai

# 2. Install frontend dependencies
cd frontend
npm install

# 3. Start development server
npm run dev
```

### Access Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001 (when running)

## 📦 Dependencies & Tech Stack

### Frontend Dependencies (Next.js)
| Package | Version | Purpose |
|---------|---------|---------|
| `next` | ^15.4.2 | React framework with SSR/SSG |
| `react` | ^18.2.0 | UI library |
| `typescript` | ^5.0.0 | Type safety and development |
| `tailwindcss` | ^3.4.0 | Utility-first CSS framework |
| `lucide-react` | ^0.263.1 | Icon library |
| `framer-motion` | ^10.16.0 | Animation library |
| `axios` | ^1.5.0 | HTTP client for API calls |
| `@types/dom-mediacapture-record` | ^1.0.11 | TypeScript types for MediaRecorder |

### Backend Dependencies (Node.js)
| Package | Version | Purpose |
|---------|---------|---------|
| `express` | ^4.18.2 | Web server framework |
| `cors` | ^2.8.5 | Cross-origin resource sharing |
| `multer` | ^1.4.5 | File upload handling |
| `axios` | ^1.5.0 | HTTP client for service communication |
| `dotenv` | ^16.3.1 | Environment variable management |

### Python Dependencies (AI Services)
| Package | Version | Purpose |
|---------|---------|---------|
| `openai-whisper` | ^20230918 | Speech-to-text transcription |
| `fastapi` | ^0.103.0 | Python web framework |
| `uvicorn` | ^0.23.0 | ASGI server |
| `python-multipart` | ^0.0.6 | File upload support |
| `pyttsx3` | ^2.90 | Text-to-speech engine |
| `gtts` | ^2.3.0 | Google Text-to-Speech |

### System Dependencies
| Tool | Version | Purpose |
|------|---------|---------|
| `ollama` | Latest | Local LLM hosting |
| `ffmpeg` | Latest | Audio processing |
| `sox` | Latest | Audio manipulation (optional) |

## 🏗️ Project Structure
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
│   ├── index.js             # Main server file
│   ├── routes/              # API routes
│   └── package.json         # Backend dependencies
├── services/
│   ├── whisper-service/     # STT service (Python/FastAPI)
│   ├── llm-service/         # LLM service (Node.js/Ollama)
│   └── tts-service/         # TTS service (Python/FastAPI)
├── docs/                    # Documentation
├── docker-compose.yml       # Docker deployment
└── README.md               # This file
```

## 🔧 Development Setup

### 1. Frontend Development
```bash
cd frontend
npm install
npm run dev
# Access: http://localhost:3000
```

### 2. Backend Services Setup
```bash
# Whisper Service
cd services/whisper-service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py

# LLM Service  
cd services/llm-service
npm install
npm start

# TTS Service
cd services/tts-service
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
```

### 3. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configurations
```

## 🧪 Testing

### Frontend Testing
```bash
cd frontend
npm run test
npm run build  # Test production build
```

### API Testing
```bash
# Test individual services
curl -X GET http://localhost:5001/health  # Whisper
curl -X GET http://localhost:5002/health  # LLM
curl -X GET http://localhost:5003/health  # TTS
```

## 🚀 Deployment

### Docker Deployment
```bash
# Build and start all services
docker-compose up --build

# Production deployment
docker-compose -f docker-compose.prod.yml up
```

### Manual Deployment
1. Install Node.js 18+ and Python 3.8+ on server
2. Install system dependencies (ffmpeg, sox)
3. Set up reverse proxy (nginx recommended)
4. Configure SSL certificates
5. Set up process management (PM2 for Node.js)

## 📚 API Documentation

### Frontend API Integration
- **POST** `/api/transcribe` - Convert audio to text
- **POST** `/api/chat` - Get AI response  
- **POST** `/api/speak` - Convert text to speech

### Service Endpoints
- **Whisper STT**: http://localhost:5001
- **LLM Service**: http://localhost:5002
- **TTS Service**: http://localhost:5003
- **Main Backend**: http://localhost:3001

## 🔒 Environment Variables
```env
# Backend Configuration
PORT=3001
FRONTEND_URL=http://localhost:3000

# Service URLs
WHISPER_SERVICE_URL=http://localhost:5001
LLM_SERVICE_URL=http://localhost:5002
TTS_SERVICE_URL=http://localhost:5003

# Database (future feature)
DATABASE_URL=postgresql://user:password@localhost:5432/healthcare_ai

# Authentication (future feature)
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Code Standards
- **Frontend**: ESLint + Prettier for JavaScript/TypeScript
- **Backend**: Black + flake8 for Python
- **Commit Messages**: Conventional Commits format
- **Testing**: All new features require tests

## 📄 License
MIT License - see [LICENSE](LICENSE) file for details

## 🆘 Troubleshooting

### Common Issues

#### Microphone Access Denied
- **Solution**: Enable microphone permissions in browser settings
- **Chrome**: Settings → Privacy and security → Site Settings → Microphone

#### Node.js Version Issues
```bash
# Check version
node --version

# Install/update Node.js
# Download from: https://nodejs.org
```

#### Python Dependencies Issues
```bash
# Clear pip cache
pip cache purge

# Reinstall dependencies
pip install --force-reinstall -r requirements.txt
```

#### Port Conflicts
- **Frontend (3000)**: Change in `package.json` scripts
- **Backend (3001)**: Change `PORT` in `.env` file
- **Services (5001-5003)**: Update service configurations

### Performance Optimization
- **Audio Quality**: Use 16kHz sample rate for faster processing
- **Model Size**: Use Whisper "tiny" or "base" for development
- **Caching**: Enable response caching for repeated queries

## 📊 System Requirements

### Minimum Requirements
- **RAM**: 8GB (16GB recommended)
- **Storage**: 10GB free space
- **CPU**: Dual-core 2.0GHz+
- **Network**: Broadband internet for initial setup

### Recommended Specifications
- **RAM**: 16GB+ (for local LLM)
- **Storage**: 50GB+ SSD
- **CPU**: Quad-core 3.0GHz+
- **GPU**: NVIDIA GPU for faster LLM inference (optional)

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
- **FastAPI Documentation**: https://fastapi.tiangolo.com

---

**Built with ❤️ by the Healthcare AI Team**