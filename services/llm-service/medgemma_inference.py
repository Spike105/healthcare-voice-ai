#!/usr/bin/env python3
"""
MedGemma Inference Service
Handles medical AI inference using Google's MedGemma model
"""

import os
import sys
import json
import argparse
from dotenv import load_dotenv
from transformers import pipeline
import torch
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MedGemmaInference:
    def __init__(self):
        self.model = None
        self.device = None
        self.setup_environment()
        
    def setup_environment(self):
        """Setup environment and authentication"""
        # Load environment variables
        load_dotenv()
        
        # Get HF_TOKEN from environment
        hf_token = os.getenv("HF_TOKEN")
        if not hf_token:
            raise ValueError("HF_TOKEN not found in environment variables. Please check your .env file.")
        
        os.environ["HF_TOKEN"] = hf_token
        logger.info("✓ HF_TOKEN set successfully")
        
        # Determine device
        if torch.cuda.is_available():
            self.device = "cuda"
            logger.info(f"✓ Using CUDA device: {torch.cuda.get_device_name(0)}")
        else:
            self.device = "cpu"
            logger.info("ℹ Using CPU (CUDA not available)")
    
    def load_model(self, model_name="google/medgemma-2b"):
        """Load MedGemma model"""
        try:
            logger.info(f"Loading MedGemma model: {model_name}")
            
            # For smaller models or CPU inference, use text-generation pipeline
            self.model = pipeline(
                "text-generation",
                model=model_name,
                device=self.device,
                torch_dtype=torch.float16 if self.device == "cuda" else torch.float32,
                trust_remote_code=True
            )
            
            logger.info("✓ MedGemma model loaded successfully")
            return True
            
        except Exception as e:
            logger.error(f"✗ Error loading MedGemma model: {e}")
            logger.error("MedGemma model failed to load. Please ensure the model is available and properly configured.")
            return False
    
    def generate_response(self, prompt, max_length=512, temperature=0.7):
        """Generate medical response using MedGemma"""
        if not self.model:
            return {
                "success": False,
                "error": "Model not loaded"
            }
        
        try:
            # Format healthcare prompt
            healthcare_prompt = f"""You are a knowledgeable healthcare AI assistant. Please provide helpful, accurate information about the following health question. Always remind users to consult healthcare professionals for medical advice.

Question: {prompt}

Response:"""
            
            # Generate response
            result = self.model(
                healthcare_prompt,
                max_length=max_length,
                temperature=temperature,
                num_return_sequences=1,
                pad_token_id=self.model.tokenizer.eos_token_id if hasattr(self.model, 'tokenizer') else None
            )
            
            # Extract generated text
            generated_text = result[0]['generated_text']
            
            # Remove the prompt from the response
            response = generated_text.replace(healthcare_prompt, "").strip()
            
            return {
                "success": True,
                "response": response,
                "model": "MedGemma",
                "confidence": 0.9
            }
            
        except Exception as e:
            logger.error(f"Error generating response: {e}")
            return {
                "success": False,
                "error": str(e)
            }

def main():
    parser = argparse.ArgumentParser(description='MedGemma Inference Service')
    parser.add_argument('--prompt', type=str, required=True, help='Input prompt for medical question')
    parser.add_argument('--max_length', type=int, default=512, help='Maximum response length')
    parser.add_argument('--temperature', type=float, default=0.7, help='Generation temperature')
    
    args = parser.parse_args()
    
    # Initialize inference service
    inference = MedGemmaInference()
    
    # Load model
    if not inference.load_model():
        print(json.dumps({"success": False, "error": "Failed to load model"}))
        sys.exit(1)
    
    # Generate response
    result = inference.generate_response(
        args.prompt,
        max_length=args.max_length,
        temperature=args.temperature
    )
    
    # Output JSON result
    print(json.dumps(result))

if __name__ == "__main__":
    main()