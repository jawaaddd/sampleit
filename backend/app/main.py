from typing import Union
from fastapi import FastAPI, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

class Sample(BaseModel):
    id: str
    name: str
    sample_url: str
    ext: str
    music_key: Union[str, None] = None
    bpm: Union[int, None] = None
    tags: list[str]

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

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Get all the samples in the database and return an array of sample_ids
@app.get("/samples/")
def getAllSamples():
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

# Get a sample by its sample_id
@app.get("/samples/{sample_id}")
def getSample(sample_id: str):
    return {"sample": sample_id}

# Upload a sample
@app.post("/samples/")
async def uploadSample(sampleFile: UploadFile):
    # TODO: Implement S3 upload and database update
    return {
        "Success": "true",
        "message": "Sample upload endpoint ready"
    }

# Get all the samples a user has saved
@app.get("/user/saves/")
def getSavedSamples(user_id: str):
    return {}

# Save a samples for a user
@app.post("/user/saves/")
def saveSample(user_id: str, sample_id: str):
    return {}
