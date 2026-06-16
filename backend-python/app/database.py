import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Database Connection URL string pointing to your local PostgreSQL instance
# Format: postgresql://username:password@localhost:port/database_name
DATABASE_URL = "postgresql://postgres:darkoak@127.0.0.1:5432/postgres"

# The core engine that manages the active network connections to PostgreSQL
engine = create_engine(DATABASE_URL)

# A session factory used to generate temporary database connection contexts
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# The base class that our models will inherit from to map code classes to DB tables
Base = declarative_base()

# Dependency provider function to safely yield database sessions to API routes
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()