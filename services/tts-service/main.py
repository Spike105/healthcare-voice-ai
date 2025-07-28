from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
import pyttsx3
import tempfile
import os
import logging
from typing import Optional
import requests
from gtts import gTTS
import io

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="TTS Service", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TextToSpeechRequest(BaseModel):
    text: str
    voice: Optional[str] = "default"
    language: Optional[str] = "en"
    engine: Optional[str] = "pyttsx3"  # "pyttsx3" or "gtts"

class TextToSpeechResponse(BaseModel):
    success: bool
    audio_url: Optional[str] = None
    error: Optional[str] = None

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "tts"}

@app.get("/voices")
async def list_voices():
    """List available voices"""
    try:
        engine = pyttsx3.init()
        voices = engine.getProperty('voices')
        
        voice_list = []
        for voice in voices:
            voice_list.append({
                "id": voice.id,
                "name": voice.name,
                "languages": voice.languages,
                "gender": voice.gender
            })
        
        return {
            "success": True,
            "voices": voice_list,
            "engines": ["pyttsx3", "gtts"]
        }
    except Exception as e:
        logger.error(f"Error listing voices: {str(e)}")
        return {
            "success": False,
            "error": str(e),
            "engines": ["pyttsx3", "gtts"]
        }

@app.post("/speak", response_model=TextToSpeechResponse)
async def text_to_speech(request: TextToSpeechRequest):
    """
    Convert text to speech using specified engine
    """
    try:
        logger.info(f"Converting text to speech: {len(request.text)} characters")
        
        if request.engine == "gtts":
            return await _speak_gtts(request)
        else:
            return await _speak_pyttsx3(request)
            
    except Exception as e:
        logger.error(f"Error in text-to-speech: {str(e)}")
        raise HTTPException(status_code=500, detail=f"TTS failed: {str(e)}")

async def _speak_gtts(request: TextToSpeechRequest):
    """Convert text to speech using gTTS (Google Text-to-Speech)"""
    try:
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as temp_file:
            temp_file_path = temp_file.name
        
        # Generate speech using gTTS
        tts = gTTS(text=request.text, lang=request.language, slow=False)
        tts.save(temp_file_path)
        
        # Return the audio file
        return FileResponse(
            temp_file_path,
            media_type="audio/mpeg",
            filename="speech.mp3",
            headers={"Content-Disposition": "attachment; filename=speech.mp3"}
        )
        
    except Exception as e:
        logger.error(f"gTTS error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"gTTS failed: {str(e)}")

async def _speak_pyttsx3(request: TextToSpeechRequest):
    """Convert text to speech using pyttsx3 (offline)"""
    try:
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_file:
            temp_file_path = temp_file.name
        
        # Initialize pyttsx3 engine
        engine = pyttsx3.init()
        
        # Set voice if specified
        if request.voice != "default":
            voices = engine.getProperty('voices')
            for voice in voices:
                if request.voice in voice.name or request.voice in voice.id:
                    engine.setProperty('voice', voice.id)
                    break
        
        # Set speech rate and volume
        engine.setProperty('rate', 150)  # Speed of speech
        engine.setProperty('volume', 0.9)  # Volume level
        
        # Save to file
        engine.save_to_file(request.text, temp_file_path)
        engine.runAndWait()
        
        # Return the audio file
        return FileResponse(
            temp_file_path,
            media_type="audio/wav",
            filename="speech.wav",
            headers={"Content-Disposition": "attachment; filename=speech.wav"}
        )
        
    except Exception as e:
        logger.error(f"pyttsx3 error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"pyttsx3 failed: {str(e)}")

@app.get("/engines")
async def list_engines():
    """List available TTS engines"""
    return {
        "engines": [
            {
                "name": "pyttsx3",
                "description": "Offline text-to-speech engine",
                "supported_formats": ["wav"],
                "languages": ["en", "system_default"]
            },
            {
                "name": "gtts",
                "description": "Google Text-to-Speech (requires internet)",
                "supported_formats": ["mp3"],
                "languages": ["en", "es", "fr", "de", "it", "pt", "ru", "ja", "ko", "zh"]
            }
        ]
    }

if __name__ == "__main__":
    import uvicorn
    logger.info("Starting TTS Service...")
    uvicorn.run(app, host="0.0.0.0", port=5003) 