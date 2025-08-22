#!/usr/bin/env python3
"""
LLM Service Test Script
Tests both direct MedGemma inference and HTTP API endpoints
"""

import requests
import json
import sys
import os
from medgemma_inference import MedGemmaInference

def test_direct_inference():
    """Test direct MedGemma inference"""
    print("\n=== Testing Direct MedGemma Inference ===")
    
    try:
        # Initialize inference
        inference = MedGemmaInference()
        
        # Load model
        if not inference.load_model():
            print("❌ Failed to load model")
            return False
            
        print("✅ Model loaded successfully")
        print(f"📱 Device: {inference.device}")
        
        # Test prompt
        test_prompt = "What are the common symptoms of a cold?"
        print(f"🔍 Testing prompt: {test_prompt}")
        
        # Generate response
        result = inference.generate_response(test_prompt, max_length=256, temperature=0.7)
        
        if result['success']:
            print("✅ Direct inference successful")
            print(f"📝 Response: {result['response'][:200]}...")
            print(f"🎯 Confidence: {result.get('confidence', 'N/A')}")
            return True
        else:
            print(f"❌ Direct inference failed: {result.get('error', 'Unknown error')}")
            return False
            
    except Exception as e:
        print(f"❌ Direct inference error: {str(e)}")
        return False

def test_http_api():
    """Test HTTP API endpoints"""
    print("\n=== Testing HTTP API Endpoints ===")
    
    base_url = "http://localhost:5002"
    
    # Test health endpoint
    try:
        print("🔍 Testing health endpoint...")
        response = requests.get(f"{base_url}/health", timeout=10)
        
        if response.status_code == 200:
            health_data = response.json()
            print("✅ Health check passed")
            print(f"📊 Status: {health_data.get('status')}")
            print(f"🤖 Model: {health_data.get('model')}")
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Health endpoint error: {str(e)}")
        return False
    
    # Test chat endpoint
    try:
        print("\n🔍 Testing chat endpoint...")
        chat_data = {
            "message": "What should I do if I have a fever?",
            "max_length": 256,
            "temperature": 0.7
        }
        
        response = requests.post(
            f"{base_url}/chat", 
            json=chat_data, 
            timeout=90  # Extended timeout for LLM processing
        )
        
        if response.status_code == 200:
            chat_result = response.json()
            print("✅ Chat endpoint successful")
            print(f"📝 Response: {chat_result.get('response', '')[:200]}...")
            print(f"🎯 Confidence: {chat_result.get('confidence', 'N/A')}")
            print(f"🔧 Type: {chat_result.get('type', 'N/A')}")
            return True
        else:
            print(f"❌ Chat endpoint failed: {response.status_code}")
            print(f"📄 Response: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Chat endpoint error: {str(e)}")
        return False

def test_setup_endpoint():
    """Test setup verification endpoint"""
    print("\n=== Testing Setup Verification ===")
    
    try:
        response = requests.get("http://localhost:5002/test-setup", timeout=90)
        
        if response.status_code == 200:
            setup_data = response.json()
            print("✅ Setup test completed")
            print(f"📊 Setup Status: {setup_data.get('setup_status')}")
            
            if setup_data.get('success'):
                print("✅ Setup verification passed")
                return True
            else:
                print(f"❌ Setup verification failed: {setup_data.get('error')}")
                print("🔧 Troubleshooting tips:")
                troubleshooting = setup_data.get('troubleshooting', {})
                for key, tip in troubleshooting.items():
                    print(f"   • {tip}")
                return False
        else:
            print(f"❌ Setup test failed: {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Setup test error: {str(e)}")
        return False

def main():
    """Run all tests"""
    print("🚀 LLM Service Test Suite")
    print("=" * 50)
    
    # Check if service is running
    try:
        response = requests.get("http://localhost:5002/health", timeout=5)
        if response.status_code != 200:
            print("❌ LLM service is not responding. Please start the service first.")
            print("💡 Run: npm start (in llm-service directory)")
            sys.exit(1)
    except requests.exceptions.RequestException:
        print("❌ LLM service is not running. Please start the service first.")
        print("💡 Run: npm start (in llm-service directory)")
        sys.exit(1)
    
    # Run tests
    results = []
    
    # Test HTTP API first (faster)
    results.append(("HTTP Health Check", test_http_api()))
    results.append(("Setup Verification", test_setup_endpoint()))
    
    # Test direct inference (slower)
    results.append(("Direct Inference", test_direct_inference()))
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 TEST RESULTS SUMMARY")
    print("=" * 50)
    
    passed = 0
    for test_name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{test_name:<20} {status}")
        if result:
            passed += 1
    
    print(f"\n🎯 Overall: {passed}/{len(results)} tests passed")
    
    if passed == len(results):
        print("🎉 All tests passed! LLM service is working correctly.")
        sys.exit(0)
    else:
        print("⚠️  Some tests failed. Check the logs above for details.")
        sys.exit(1)

if __name__ == "__main__":
    main()