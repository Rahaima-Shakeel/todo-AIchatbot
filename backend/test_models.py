
import os
import asyncio
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()

async def test_models():
    api_key = os.getenv("OPENAI_API_KEY", "").strip().strip('"').strip("'")
    api_base = "https://generativelanguage.googleapis.com/v1beta/openai/"
    
    client = AsyncOpenAI(
        api_key=api_key,
        base_url=api_base
    )
    
    models = [
        "gemini-2.0-flash-exp",
        "gemini-2.0-flash-thinking-exp",
        "gemini-2.0-pro-exp-02-05",
        "gemini-1.5-flash-latest",
        "gemini-1.5-flash",
        "gemini-1.5-pro-latest",
        "gemini-1.5-pro",
        "gemini-flash-lite-latest",
        "gemini-flash-latest"
    ]
    
    for model in models:
        print(f"--- Testing model: {model} ---")
        try:
            response = await client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": "Hello"}],
                max_tokens=5
            )
            print(f"✅ SUCCESS: {model} worked!")
        except Exception as e:
            err = str(e)
            if "429" in err:
                print(f"❌ 429 QUOTA EXHAUSTED for {model}")
            elif "404" in err:
                print(f"❓ 404 NOT FOUND for {model}")
            else:
                print(f"⚠️ ERROR for {model}: {err[:100]}...")

if __name__ == "__main__":
    asyncio.run(test_models())
