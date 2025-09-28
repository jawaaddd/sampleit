import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from dotenv import load_dotenv

load_dotenv()

# Base class for models
Base = declarative_base()

# Database URL
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg2://app:pineapplel@localhost:5432/sampleit"
)

# SQLAlchemy engine
engine = create_engine(
    DATABASE_URL,
    echo=True,  # optional: log SQL queries
    future=True
)

# Session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Utility to create all tables
def init_db():
    from Models import User, Sample, SavedSample
    Base.metadata.create_all(bind=engine)