import warnings
warnings.filterwarnings("ignore", message="FP16 is not supported on CPU; using FP32 instead")

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import tempfile
import os
import logging
from typing import Optional
import json
from google.cloud import speech
from google.oauth2 import service_account

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Google Cloud STT Service", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Google Cloud credentials
GOOGLE_APPLICATION_CREDENTIALS = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')

def get_speech_client():
    """Initialize Google Cloud Speech client"""
    if GOOGLE_APPLICATION_CREDENTIALS:
        # Use service account credentials
        credentials = service_account.Credentials.from_service_account_file(
            GOOGLE_APPLICATION_CREDENTIALS
        )
        return speech.SpeechClient(credentials=credentials)
    elif GOOGLE_API_KEY:
        # Use API key (for limited functionality)
        return speech.SpeechClient()
    else:
        raise Exception("No Google Cloud credentials found. Set GOOGLE_APPLICATION_CREDENTIALS or GOOGLE_API_KEY environment variable.")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "google-cloud-stt"}

@app.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    """
    Transcribe audio file to text using Google Cloud Speech-to-Text
    """
    try:
        # Validate file type
        if not file.content_type or not file.content_type.startswith('audio/'):
            raise HTTPException(status_code=400, detail="File must be an audio file")
        
        logger.info(f"Processing audio file: {file.filename}, type: {file.content_type}, size: {file.size} bytes")
        
        # Read audio content
        content = await file.read()
        
        # Initialize speech client
        client = get_speech_client()
        
        # Configure audio
        audio = speech.RecognitionAudio(content=content)
        
        # Configure recognition
        config = speech.RecognitionConfig(
            encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
            sample_rate_hertz=16000,  # Adjust based on your audio
            language_code="en-US",
            enable_automatic_punctuation=True,
            enable_word_time_offsets=True,
            model="latest_long"  # Use latest model for better accuracy
        )
        
        # Handle different audio formats
        content_type_to_encoding = {
            'audio/wav': speech.RecognitionConfig.AudioEncoding.LINEAR16,
            'audio/webm': speech.RecognitionConfig.AudioEncoding.WEBM_OPUS,
            'audio/mp4': speech.RecognitionConfig.AudioEncoding.MP3,
            'audio/mpeg': speech.RecognitionConfig.AudioEncoding.MP3,
            'audio/ogg': speech.RecognitionConfig.AudioEncoding.OGG_OPUS
        }
        
        if file.content_type in content_type_to_encoding:
            config.encoding = content_type_to_encoding[file.content_type]
        
        # Perform transcription
        logger.info("Starting Google Cloud transcription...")
        response = client.recognize(config=config, audio=audio)
        
        # Extract transcription
        transcription = ""
        for result in response.results:
            transcription += result.alternatives[0].transcript + " "
        
        transcription = transcription.strip()
        
        logger.info(f"Transcription completed: {len(transcription)} characters")
        logger.info(f"Transcription: {transcription}")
        
        return {
            "success": True,
            "transcription": transcription,
            "language": "en-US",
            "confidence": response.results[0].alternatives[0].confidence if response.results else 0,
            "service": "google-cloud-speech-to-text"
        }
        
    except Exception as e:
        logger.error(f"Error transcribing audio: {str(e)}")
        logger.error(f"Exception type: {type(e).__name__}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")

@app.get("/models")
async def list_models():
    """List available Google Cloud Speech models"""
    return {
        "available_models": ["latest_long", "latest_short", "command_and_search", "phone_call", "video", "default"],
        "current_model": "latest_long",
        "description": "Google Cloud Speech-to-Text API with automatic language detection",
        "supported_formats": ["wav", "webm", "mp4", "mp3", "ogg"],
        "supported_languages": ["en-US", "en-GB", "es-ES", "fr-FR", "de-DE", "it-IT", "pt-BR", "ru-RU", "ja-JP", "ko-KR", "zh-CN"]
    }

@app.get("/setup")
async def setup_info():
    """Get setup information for Google Cloud Speech-to-Text"""
    return {
        "setup_required": True,
        "credentials_needed": "GOOGLE_APPLICATION_CREDENTIALS or GOOGLE_API_KEY",
        "instructions": [
            "1. Create a Google Cloud project",
            "2. Enable Speech-to-Text API",
            "3. Create a service account and download JSON credentials",
            "4. Set GOOGLE_APPLICATION_CREDENTIALS environment variable to path of credentials file",
            "5. Or set GOOGLE_API_KEY environment variable (limited functionality)"
        ],
        "documentation": "https://cloud.google.com/speech-to-text/docs/quickstart"
    }

if __name__ == "__main__":
    import uvicorn
    logger.info("Starting Google Cloud STT Service...")
    uvicorn.run(app, host="0.0.0.0", port=5001)