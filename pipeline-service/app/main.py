from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import pipelines, logs
from app.core.database import Base, engine

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="CloudForge Pipeline Service", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://localhost:80",
        "http://localhost",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(pipelines.router, prefix="/api", tags=["pipelines"])
app.include_router(logs.router, prefix="/api", tags=["logs"])


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "pipeline-service"}


@app.get("/")
def root():
    return {"message": "CloudForge Pipeline Service", "version": "1.0.0"}
