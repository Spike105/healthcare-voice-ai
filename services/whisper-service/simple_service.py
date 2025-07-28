from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import whisper
import tempfile
import os
import logging
import time

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = FastAPI(title="Simple Whisper STT Service", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model variable
model = None

def load_model():
    global model
    if model is None:
        logger.info("Loading Whisper model...")
        start_time = time.time()
        model = whisper.load_model("tiny")
        load_time = time.time() - start_time
        logger.info(f"Whisper model loaded successfully in {load_time:.2f} seconds")
    return model

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    logger.info("Health check requested")
    return {"status": "healthy", "service": "simple-whisper-stt"}

@app.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    """Transcribe audio file to text using Whisper"""
    start_time = time.time()
    
    try:
        logger.info(f"Received audio file: {file.filename}, size: {file.size} bytes, type: {file.content_type}")
        
        # Validate file
        if not file.content_type or not file.content_type.startswith('audio/'):
            raise HTTPException(status_code=400, detail="File must be an audio file")
        
        # Load model
        model = load_model()
        
        # Determine file extension based on content type
        content_type_to_ext = {
            'audio/wav': '.wav',
            'audio/webm': '.webm',
            'audio/webm;codecs=opus': '.webm',
            'audio/mp4': '.mp4',
            'audio/mpeg': '.mp3',
            'audio/ogg': '.ogg'
        }
        file_ext = content_type_to_ext.get(file.content_type, '.wav')
        
        # Save uploaded file temporarily with correct extension
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name
        
        logger.info(f"Saved temporary file: {temp_file_path}")
        
        try:
            # Transcribe audio
            logger.info("Starting transcription...")
            transcribe_start = time.time()
            result = model.transcribe(temp_file_path)
            transcribe_time = time.time() - transcribe_start
            
            transcription = result["text"].strip()
            
            logger.info(f"Transcription completed in {transcribe_time:.2f} seconds")
            logger.info(f"Transcription: {transcription}")
            
            total_time = time.time() - start_time
            logger.info(f"Total processing time: {total_time:.2f} seconds")
            
            return {
                "success": True,
                "transcription": transcription,
                "language": result.get("language", "unknown"),
                "processing_time": total_time
            }
            
        finally:
            # Clean up temporary file
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
                logger.info(f"Cleaned up temporary file")
                
    except Exception as e:
        logger.error(f"Error transcribing audio: {str(e)}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    logger.info("Starting Simple Whisper STT Service...")
    logger.info("Loading model on startup...")
    load_model()  # Pre-load the model
    logger.info("Starting server on port 5001...")
    uvicorn.run(app, host="0.0.0.0", port=5001, log_level="info") 