import os
import logging
import tempfile
import httpx
import asyncio
from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from google.cloud import speech
from google.oauth2 import service_account
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# LLM Service Configuration
LLM_SERVICE_URL = os.getenv('LLM_SERVICE_URL', 'http://localhost:5002')
LLM_CHAT_ENDPOINT = f"{LLM_SERVICE_URL}/chat"

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

async def send_to_llm(transcript: str) -> dict:
    """Send transcription to LLM service for processing"""
    try:
        async with httpx.AsyncClient(timeout=130.0) as client:
            response = await client.post(
                LLM_CHAT_ENDPOINT,
                json={
                    "message": transcript,
                    "context": "medical_transcription"
                }
            )
            
            if response.status_code == 200:
                llm_data = response.json()
                logger.info(f"LLM response received: {llm_data.get('response', '')[:100]}...")
                return {
                    "success": True,
                    "response": llm_data.get('response', ''),
                    "status": "processed"
                }
            else:
                logger.error(f"LLM service error: {response.status_code} - {response.text}")
                return {
                    "success": False,
                    "error": f"LLM service returned {response.status_code}",
                    "status": "error"
                }
                
    except httpx.TimeoutException:
        logger.error("LLM service timeout")
        return {
            "success": False,
            "error": "LLM service timeout",
            "status": "timeout"
        }
    except Exception as e:
        logger.error(f"Error communicating with LLM service: {str(e)}")
        return {
            "success": False,
            "error": f"LLM communication error: {str(e)}",
            "status": "error"
        }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "stt-service"}

# Add these imports at the top
from google.cloud import speech
from google.oauth2 import service_account
from fastapi import File, UploadFile

# Replace the mock websocket endpoint with a proper HTTP POST endpoint
@app.post("/transcribe")
async def transcribe_audio(audio: UploadFile = File(None), text: str = Form(None)):
    try:
        # Handle text input directly
        if text and not audio:
            logger.info(f"Received text input: {text[:50]}...")
            
            # Send text directly to LLM service for processing
            llm_response = await send_to_llm(text)
            
            return {
                "text": text,
                "confidence": 1.0,
                "status": "success",
                "config_used": "text_input",
                "llm_response": llm_response
            }
        
        # Handle audio input
        if not audio:
            raise HTTPException(status_code=400, detail="Either audio file or text must be provided")
            
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
        
        # Try different configurations based on common formats
        configs_to_try = []
        
        # Configuration 1: WEBM OPUS (common for browser recordings)
        configs_to_try.append(speech.RecognitionConfig(
            encoding=speech.RecognitionConfig.AudioEncoding.WEBM_OPUS,
            sample_rate_hertz=48000,
            language_code="en-US",
            enable_automatic_punctuation=True,
            model="medical_conversation",
        ))
        
        # Configuration 2: WAV LINEAR16 with 48kHz (high quality)
        configs_to_try.append(speech.RecognitionConfig(
            encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
            sample_rate_hertz=48000,
            language_code="en-US",
            enable_automatic_punctuation=True,
            model="medical_conversation",
        ))
        
        # Configuration 3: WAV LINEAR16 with 16kHz (standard)
        configs_to_try.append(speech.RecognitionConfig(
            encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
            sample_rate_hertz=16000,
            language_code="en-US",
            enable_automatic_punctuation=True,
            model="medical_conversation",
        ))
        
        # Configuration 4: Auto-detect encoding and sample rate
        configs_to_try.append(speech.RecognitionConfig(
            language_code="en-US",
            enable_automatic_punctuation=True,
            model="medical_conversation",
        ))
        
        # Try each configuration until one works
        last_error = None
        for i, config in enumerate(configs_to_try):
            try:
                logger.info(f"Trying config {i+1}: encoding={getattr(config, 'encoding', 'AUTO')}, sample_rate={getattr(config, 'sample_rate_hertz', 'AUTO')}")
                
                # Perform transcription
                response = client.recognize(config=config, audio=audio_data)
                
                if response.results:
                    # Get the best transcription result
                    result = response.results[0]
                    transcript = result.alternatives[0].transcript
                    confidence = result.alternatives[0].confidence
                    
                    logger.info(f"Transcription successful with config {i+1}: '{transcript}' (confidence: {confidence})")
                    
                    # Send transcription to LLM service for processing
                    llm_response = await send_to_llm(transcript)
                    
                    return {
                        "text": transcript,
                        "confidence": confidence,
                        "status": "success",
                        "config_used": i+1,
                        "llm_response": llm_response
                    }
                else:
                    logger.info(f"Config {i+1} worked but no speech detected")
                    return {
                        "text": "",
                        "confidence": 0.0,
                        "error": "No speech detected",
                        "status": "no_speech"
                    }
                    
            except Exception as config_error:
                logger.warning(f"Config {i+1} failed: {str(config_error)}")
                last_error = config_error
                continue
        
        # If all configurations failed
        logger.error(f"All configurations failed. Last error: {str(last_error)}")
        return {
            "text": "",
            "confidence": 0.0,
            "error": f"All audio configurations failed. Last error: {str(last_error)}",
            "status": "error"
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
