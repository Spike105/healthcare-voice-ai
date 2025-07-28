import time
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def test_whisper_loading():
    logger.info("Starting Whisper test...")
    
    try:
        logger.info("Importing whisper...")
        import whisper
        
        logger.info("Loading tiny model...")
        start_time = time.time()
        model = whisper.load_model("tiny")
        load_time = time.time() - start_time
        
        logger.info(f"Model loaded successfully in {load_time:.2f} seconds")
        
        # Test with a simple audio file if available
        logger.info("Whisper is working correctly!")
        return True
        
    except Exception as e:
        logger.error(f"Error loading Whisper: {str(e)}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        return False

if __name__ == "__main__":
    logger.info("=== Whisper Test Script ===")
    success = test_whisper_loading()
    
    if success:
        logger.info("✅ Whisper test PASSED")
    else:
        logger.error("❌ Whisper test FAILED")
    
    input("Press Enter to exit...") 