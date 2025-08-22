# MedGemma LLM Service Setup Guide

This guide will help you set up the Healthcare LLM Service to use Google's MedGemma model instead of Ollama.

## Prerequisites

1. **Python 3.8+** installed and accessible via `python` command
2. **Node.js 18+** and npm
3. **Hugging Face Account** with access to MedGemma models
4. **GPU recommended** (CUDA-compatible) for better performance

## Setup Steps

### 1. Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Install Python dependencies
npm run install-python-deps
# OR manually:
pip install -r requirements.txt
```

### 2. Configure Environment

1. Get your Hugging Face token:
   - Go to https://huggingface.co/settings/tokens
   - Create a new token with "Read" permissions
   - Request access to MedGemma models if needed

2. Update the `.env` file:
   ```env
   # Replace 'your_huggingface_token_here' with your actual token
   HF_TOKEN=hf_your_actual_token_here
   MEDGEMMA_MODEL=google/medgemma-2b
   MAX_LENGTH=512
   TEMPERATURE=0.7
   ```

### 3. Test the Setup

```bash
# Start the service
npm start

# In another terminal, test the setup
curl http://localhost:5002/test-setup
```

### 4. Available Models

- `google/medgemma-2b` - Smaller model, faster inference
- `google/medgemma-7b` - Larger model, better performance
- `google/medgemma-27b` - Largest model, requires significant resources

## API Endpoints

### Health Check
```bash
GET http://localhost:5002/health
```

### Chat
```bash
POST http://localhost:5002/chat
Content-Type: application/json

{
  "message": "What are the symptoms of diabetes?",
  "max_length": 512,
  "temperature": 0.7
}
```

### Test Setup
```bash
GET http://localhost:5002/test-setup
```

## Troubleshooting

### Common Issues

1. **Python not found**
   - Ensure Python is installed and in PATH
   - Try `python3` instead of `python` in package.json scripts

2. **HF_TOKEN not working**
   - Verify token is correct and has proper permissions
   - Check if you have access to MedGemma models

3. **Out of memory errors**
   - Try a smaller model (medgemma-2b)
   - Use CPU inference if GPU memory is insufficient
   - Reduce max_length parameter

4. **Slow inference**
   - Use GPU if available
   - Consider model quantization for faster inference
   - Reduce max_length for shorter responses

### Performance Tips

1. **GPU Usage**: The service automatically detects and uses CUDA if available
2. **Model Caching**: Models are cached after first load
3. **Batch Processing**: Consider implementing batch processing for multiple requests
4. **Quantization**: Use 4-bit or 8-bit quantization for memory efficiency

## Migration from Ollama

The service maintains API compatibility with the previous Ollama implementation:
- Same endpoints (`/health`, `/chat`)
- Same request/response format
- Automatic fallback responses on errors

## Development

```bash
# Development mode with auto-restart
npm run dev

# Run tests
npm test
```

## Production Deployment

For production deployment:
1. Use environment variables for configuration
2. Consider using PM2 for process management
3. Set up proper logging and monitoring
4. Use a reverse proxy (nginx) for better performance
5. Consider using a dedicated GPU server for inference

## Support

If you encounter issues:
1. Check the console logs for detailed error messages
2. Verify all dependencies are installed correctly
3. Test with the `/test-setup` endpoint
4. Ensure your Hugging Face token has proper permissions