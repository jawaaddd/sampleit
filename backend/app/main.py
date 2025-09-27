from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .models import Sample

app = FastAPI(title="Sample It API", version="1.0.0")

# Configure CORS for React Native
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Sample It API is running!"}

@app.get("/samples")
async def get_samples():
    # TODO: Replace with actual database query
    return [
        {
            "id": "1",
            "artist": "Kanye West",
            "song_name": "runaway",
            "genre": "Hip Hop",
            "video_url": "/videos/sample1.mp4",
            "audio_url": "/audio/sample1.mp3"
        },
        {
            "id": "2", 
            "artist": "Daft Punk",
            "song_name": "One More Time",
            "genre": "Electronic",
            "video_url": "/videos/sample2.mp4",
            "audio_url": "/audio/sample2.mp3"
        }
    ]

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

