from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import whisper
import tempfile
import os
import logging
from typing import Optional

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Whisper STT Service", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Whisper model (use 'tiny' for faster processing, 'base' for better accuracy)
model = None

def load_model():
    global model
    if model is None:
        logger.info("Loading Whisper model...")
        model = whisper.load_model("tiny")  # Options: tiny, base, small, medium, large
        logger.info("Whisper model loaded successfully")
    return model

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "whisper-stt"}

@app.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    """
    Transcribe audio file to text using Whisper
    """
    try:
        # Validate file type
        if not file.content_type or not file.content_type.startswith('audio/'):
            raise HTTPException(status_code=400, detail="File must be an audio file")
        
        logger.info(f"Processing audio file: {file.filename}, type: {file.content_type}, size: {file.size} bytes")
        
        # Load model
        model = load_model()
        
        # Determine file extension based on content type
        content_type_to_ext = {
            'audio/wav': '.wav',
            'audio/webm': '.webm',
            'audio/mp4': '.mp4',
            'audio/mpeg': '.mp3',
            'audio/ogg': '.ogg'
        }
        file_ext = content_type_to_ext.get(file.content_type, '.wav')
        
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name
        
        logger.info(f"Saved temporary file: {temp_file_path}")
        
        try:
            # Transcribe audio
            logger.info("Starting transcription...")
            result = model.transcribe(temp_file_path)
            transcription = result["text"].strip()
            
            logger.info(f"Transcription completed: {len(transcription)} characters")
            logger.info(f"Transcription: {transcription}")
            
            return {
                "success": True,
                "transcription": transcription,
                "language": result.get("language", "unknown"),
                "duration": result.get("segments", [{}])[0].get("end", 0) if result.get("segments") else 0
            }
            
        finally:
            # Clean up temporary file
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
                logger.info(f"Cleaned up temporary file: {temp_file_path}")
                
    except Exception as e:
        logger.error(f"Error transcribing audio: {str(e)}")
        logger.error(f"Exception type: {type(e).__name__}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")

@app.get("/models")
async def list_models():
    """List available Whisper models"""
    return {
        "available_models": ["tiny", "base", "small", "medium", "large"],
        "current_model": "tiny",
        "description": "Use /transcribe endpoint to transcribe audio files"
    }

if __name__ == "__main__":
    import uvicorn
    logger.info("Starting Whisper STT Service...")
    uvicorn.run(app, host="0.0.0.0", port=5001) 