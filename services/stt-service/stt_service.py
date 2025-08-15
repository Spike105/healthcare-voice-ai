import os
import logging
import tempfile
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from google.cloud import speech
from google.oauth2 import service_account
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="STT Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Google Speech client
def get_speech_client():
    try:
        # Option 1: Use API key from environment (simpler for testing)
        api_key = os.getenv('GOOGLE_API_KEY')
        if api_key:
            # Set the API key for Google client library
            os.environ['GOOGLE_API_KEY'] = api_key
            try:
                client = speech.SpeechClient()
                logger.info("Successfully initialized Google Speech client with API key")
                return client
            except Exception as e:
                logger.warning(f"API key authentication failed: {e}")
            
        # Option 2: Use service account key file (recommended)
        service_account_path = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')
        if service_account_path and os.path.exists(service_account_path):
            credentials = service_account.Credentials.from_service_account_file(service_account_path)
            client = speech.SpeechClient(credentials=credentials)
            logger.info("Successfully initialized Google Speech client with service account")
            return client
        
        # Option 3: Try default credentials
        client = speech.SpeechClient()
        logger.info("Successfully initialized Google Speech client with default credentials")
        return client
        
    except Exception as e:
        logger.error(f"Failed to initialize Google Speech client: {e}")
        return None

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "stt-service"}

# Add these imports at the top
from google.cloud import speech
from google.oauth2 import service_account
from fastapi import File, UploadFile

# Replace the mock websocket endpoint with a proper HTTP POST endpoint
@app.post("/transcribe")
async def transcribe_audio(audio: UploadFile = File(...)):
    # Real Google Speech-to-Text implementation here
    # (Use the full code I provided earlier)
    try:
        logger.info(f"Received audio file: {audio.filename}, size: {audio.size}")
        
        # Read audio content
        audio_content = await audio.read()
        
        # Initialize Google Speech client
        client = get_speech_client()
        if not client:
            # Fallback to mock for testing
            logger.warning("Google Speech client not available, using mock response")
            return {
                "text": "Mock transcription - Google API not configured properly",
                "confidence": 0.5,
                "error": "Google Speech API not configured"
            }
        
        # Configure recognition
        audio_data = speech.RecognitionAudio(content=audio_content)
        
        # Detect audio format and configure accordingly
        config = speech.RecognitionConfig(
            encoding=speech.RecognitionConfig.AudioEncoding.WEBM_OPUS,  # For browser recordings
            sample_rate_hertz=48000,  # Common browser sample rate
            language_code="en-US",
            enable_automatic_punctuation=True,
            model="medical_conversation",  # Use medical model for healthcare
        )
        
        # Alternative config for different audio formats
        if audio.content_type and "wav" in audio.content_type:
            config.encoding = speech.RecognitionConfig.AudioEncoding.LINEAR16
            config.sample_rate_hertz = 16000
        elif audio.content_type and "mp3" in audio.content_type:
            config.encoding = speech.RecognitionConfig.AudioEncoding.MP3
        
        logger.info(f"Using audio config: encoding={config.encoding}, sample_rate={config.sample_rate_hertz}")
        
        # Perform transcription
        response = client.recognize(config=config, audio=audio_data)
        
        if response.results:
            # Get the best transcription result
            result = response.results[0]
            transcript = result.alternatives[0].transcript
            confidence = result.alternatives[0].confidence
            
            logger.info(f"Transcription successful: '{transcript}' (confidence: {confidence})")
            
            return {
                "text": transcript,
                "confidence": confidence,
                "status": "success"
            }
        else:
            logger.warning("No speech detected in audio")
            return {
                "text": "",
                "confidence": 0.0,
                "error": "No speech detected",
                "status": "no_speech"
            }
            
    except Exception as e:
        logger.error(f"Transcription error: {str(e)}")
        return {
            "text": "",
            "confidence": 0.0,
            "error": str(e),
            "status": "error"
        }

if __name__ == "__main__":
    import uvicorn
    logger.info("Starting STT Service on port 5001...")
    uvicorn.run(app, host="0.0.0.0", port=5001)
