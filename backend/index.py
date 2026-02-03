"""
Vercel Serverless Entry Point for FastAPI Backend
Handles environment validation, error logging, and proper ASGI app export
"""
import os
import sys
import logging

# Configure logging for Vercel
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    stream=sys.stdout
)
logger = logging.getLogger(__name__)

# Validate critical environment variables before importing app
REQUIRED_ENV_VARS = [
    "DATABASE_URL",
    "OPENAI_API_KEY",
    "JWT_SECRET"
]

missing_vars = [var for var in REQUIRED_ENV_VARS if not os.getenv(var)]
if missing_vars:
    error_msg = f"CRITICAL: Missing required environment variables: {', '.join(missing_vars)}"
    logger.error(error_msg)
    # Create a minimal FastAPI app to show error
    from fastapi import FastAPI
    from fastapi.responses import JSONResponse
    
    app = FastAPI()
    
    @app.get("/")
    @app.get("/{full_path:path}")
    async def error_handler():
        return JSONResponse(
            status_code=500,
            content={
                "error": "Server configuration error",
                "message": f"Missing environment variables: {', '.join(missing_vars)}",
                "required_vars": REQUIRED_ENV_VARS
            }
        )
else:
    try:
        logger.info("Environment variables validated successfully")
        logger.info(f"Importing FastAPI app from app.main...")
        from app.main import app
        logger.info("FastAPI app imported successfully")
    except Exception as e:
        logger.error(f"Failed to import app: {str(e)}")
        import traceback
        traceback.print_exc()
        
        # Create error app
        from fastapi import FastAPI
        from fastapi.responses import JSONResponse
        
        app = FastAPI()
        
        @app.get("/")
        @app.get("/{full_path:path}")
        async def import_error_handler():
            return JSONResponse(
                status_code=500,
                content={
                    "error": "Application import failed",
                    "message": str(e),
                    "type": type(e).__name__
                }
            )

# Export for Vercel (must be named 'app')
__all__ = ['app']
