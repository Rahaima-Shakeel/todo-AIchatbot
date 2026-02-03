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
IS_SERVERLESS = os.getenv("VERCEL", "0") == "1" or IS_PRODUCTION

# Create engine with serverless-optimized settings
if IS_SERVERLESS:
    # Serverless (Vercel) - minimal pooling, aggressive recycling
    engine = create_engine(
        DATABASE_URL,
        echo=False,
        pool_pre_ping=True,       # Always check connection
        pool_size=1,               # Minimal pool for serverless (each function is isolated)
        max_overflow=0,            # No overflow
        pool_recycle=300,          # Recycle after 5 minutes
        connect_args={
            "connect_timeout": 10,  # Faster timeout
            "options": "-c statement_timeout=30000"  # 30s query timeout
        }
    )
else:
    # Development/Traditional server
    engine = create_engine(
        DATABASE_URL, 
        echo=False if IS_PRODUCTION else True,
        pool_pre_ping=True,
        pool_recycle=300,
        pool_size=5,
        max_overflow=10
    )


def create_db_and_tables():
    """Create all database tables with error handling for serverless."""
    try:
        SQLModel.metadata.create_all(engine)
    except Exception as e:
        # Log but don't crash - tables may already exist
        import logging
        logger = logging.getLogger(__name__)
        logger.warning(f"Table creation warning (may be expected): {str(e)}")


def get_session() -> Generator[Session, None, None]:
    """Dependency to get database session."""
    with Session(engine) as session:
        yield session
