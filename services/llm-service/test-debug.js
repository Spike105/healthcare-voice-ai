const axios = require('axios');

async function testOllama() {
  try {
    console.log('Testing Ollama directly...');
    
    const response = await axios.post('http://localhost:11434/api/generate', {
      model: 'tinyllama:latest',
      prompt: 'Hello, how are you?',
      stream: false
    }, {
      timeout: 30000
    });
    
    console.log('Ollama response:', response.data.response);
    return true;
  } catch (error) {
    console.error('Ollama test failed:', error.message);
    if (error.response) {
      console.error('Error response:', error.response.data);
    }
    return false;
  }
}

async function testLLMService() {
  try {
    console.log('\nTesting LLM service...');
    
    const response = await axios.post('http://localhost:5002/chat', {
      message: 'What are the symptoms of a headache?'
    }, {
      timeout: 30000
    });
    
    console.log('LLM service response:', response.data.response);
    return true;
  } catch (error) {
    console.error('LLM service test failed:', error.message);
    if (error.response) {
      console.error('Error response:', error.response.data);
    }
    return false;
  }
}

async function runTests() {
  console.log('Starting LLM debugging tests...\n');
  
  const ollamaWorks = await testOllama();
  const llmWorks = await testLLMService();
  
  console.log('\n=== Test Results ===');
  console.log('Ollama direct test:', ollamaWorks ? 'PASSED' : 'FAILED');
  console.log('LLM service test:', llmWorks ? 'PASSED' : 'FAILED');
  
  if (!ollamaWorks) {
    console.log('\nOllama is not working - check if Ollama is running');
  } else if (!llmWorks) {
    console.log('\nOllama works but LLM service fails - check LLM service code');
  } else {
    console.log('\nBoth tests passed!');
  }
}

runTests().catch(console.error); 