from sqlmodel import create_engine, SQLModel, Session
from typing import Generator
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set")

# Determine if we're in production
IS_PRODUCTION = os.getenv("ENVIRONMENT", "development").lower() == "production"

# Create engine with robust connection pooling for serverless DBs (Neon)
engine = create_engine(
    DATABASE_URL, 
    echo=False if IS_PRODUCTION else True,  # Disable SQL logging in production
    pool_pre_ping=True,      # Check connection status before use
    pool_recycle=300,        # Recycle connections every 5 minutes
    pool_size=5,             # Limit pool size
    max_overflow=10          # Allow some temporary overflow
)


def create_db_and_tables():
    """Create all database tables."""
    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    """Dependency to get database session."""
    with Session(engine) as session:
        yield session
