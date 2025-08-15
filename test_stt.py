import requests
import os

def test_transcription():
    url = "http://localhost:5001/transcribe"
    
    # Use the harvard.wav file from testing folder
    audio_file = "testing/harvard.wav"
    
    if not os.path.exists(audio_file):
        print(f"Audio file not found: {audio_file}")
        return
    
    try:
        with open(audio_file, 'rb') as f:
            files = {'audio': f}
            response = requests.post(url, files=files)
            
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_transcription()