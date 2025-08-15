from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
import tempfile
import logging
from typing import Optional

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="TTS Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TextToSpeechRequest(BaseModel):
    text: str
    voice: Optional[str] = "default"
    language: Optional[str] = "en"
    engine: Optional[str] = "test"

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "tts"}

@app.post("/speak")
async def text_to_speech(request: TextToSpeechRequest):
    try:
        logger.info(f"Converting text to speech: {len(request.text)} characters")
        
        # Create a simple test response
        # In production, implement actual TTS conversion
        return {
            "success": True,
            "message": f"TTS request received for text: '{request.text[:50]}...'",
            "voice": request.voice,
            "engine": request.engine
        }
        
    except Exception as e:
        logger.error(f"Error in text-to-speech: {str(e)}")
        raise HTTPException(status_code=500, detail=f"TTS failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    logger.info("Starting TTS Service on port 5003...")
    uvicorn.run(app, host="0.0.0.0", port=5013)
