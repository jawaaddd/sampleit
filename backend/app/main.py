from typing import Union
from fastapi import FastAPI, UploadFile
from pydantic import BaseModel
import s3_utils

class Sample(BaseModel):
    id: str
    name: str
    sample_url: str
    ext: str
    music_key: Union[str, None] = None
    bpm: Union[int, None] = None
    tags: list[str]


app = FastAPI()


# Get all the samples in the database and return an array of sample_ids
@app.get("/samples/")
def getAllSamples():
    return {}

# Get a sample by its sample_id
@app.get("/samples/{sample_id}")
def getSample(sample_id: str):
    return {"sample": sample_id}

# Upload a sample
@app.post("/samples/")
async def uploadSample(sampleFile: UploadFile):
    uuid = ""
    s3Link = s3_utils.s3.upload_fileobj(sampleFile.file, sampleFile.filename, uuid)
    # TODO: Update the database
    return {
        "Success": "true",
        "s3_link": s3Link
    }

# Get all the samples a user has saved
@app.get("/user/saves/")
def getSavedSamples(user_id: str):
    return {}

# Save a samples for a user
@app.post("/user/saves/")
def saveSample(user_id: str, sample_id: str):
    return {}
