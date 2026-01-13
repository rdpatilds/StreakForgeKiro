from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .database import engine
from .models import Base
from .routers import habits, completions, streaks

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create database tables
    Base.metadata.create_all(bind=engine)
    yield
    # Shutdown: Clean up if needed

app = FastAPI(
    title="StreakForge API",
    description="Personal habit tracking application",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # React dev server
        "http://localhost:5173",  # Vite dev server
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Include routers with API versioning
app.include_router(habits.router, prefix="/api/v1")
app.include_router(completions.router, prefix="/api/v1")
app.include_router(streaks.router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "StreakForge API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
