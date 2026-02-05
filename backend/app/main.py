from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os

from app.database import create_db_and_tables
from app.routers import users, tasks, chat


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan event handler for startup and shutdown."""
    # Startup: Create database tables
    create_db_and_tables()
    yield
    # Shutdown: cleanup if needed
    pass


# Create FastAPI application
app = FastAPI(
    title="Todo API",
    description="Full-stack todo application API with authentication",
    version="2.0.0",
    lifespan=lifespan
)

# Configure CORS
origins = [origin for origin in os.getenv("CORS_ORIGINS", "").split(",") if origin]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(users.router)
app.include_router(tasks.router)
app.include_router(chat.router)


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Todo API v2.0",
        "status": "running",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}
