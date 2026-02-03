
import os
import requests
from dotenv import load_dotenv

load_dotenv()

def list_gemini_models():
    api_key = os.getenv("OPENAI_API_KEY", "").strip().strip('"').strip("'")
    if not api_key:
        print("No API key found.")
        return

    url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
    
    try:
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            print("--- Available Models ---")
            for model in data.get('models', []):
                name = model.get('name', '')
                displayName = model.get('displayName', '')
                supportedMethods = model.get('supportedGenerationMethods', [])
                if 'generateContent' in supportedMethods:
                    print(f"- {name} ({displayName})")
        else:
            print(f"Failed to list models: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    list_gemini_models()
