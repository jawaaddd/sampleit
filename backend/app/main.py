from typing import Union
from fastapi import FastAPI, UploadFile, HTTPException, Depends
from pydantic import BaseModel
import uuid as uuid_lib
import s3_utils
import Models
from database import SessionLocal
from sqlalchemy.orm import Session


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


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
    file_uuid = str(uuid_lib.uuid4())
    print("FILENAME:", sampleFile.filename, "UUID:", file_uuid)
    print("DEBUG file:", sampleFile.file)
    s3Link = s3_utils.upload_fileobj(
        file_obj=sampleFile.file,
        filename=sampleFile.filename,
        uuid=file_uuid
    )
    # TODO: Update the database
    try:
        # Generate UUID for this sample (used in S3 key)
        sample_uuid = str(uuid_lib.uuid4())

        # Upload to S3
        s3_url = upload_fileobj(
            file_obj=sampleFile.file,
            filename=sampleFile.filename,
            uuid=sample_uuid
        )

        # Insert new Sample into DB
        new_sample = Sample(
            sample_id=sample_uuid,        # use UUID for primary key
            sample_name=sampleFile.filename,
            sample_url=s3_url,
            uploader_id=uploader_id       # can be None for fake/demo user
        )

        db.add(new_sample)
        db.commit()
        db.refresh(new_sample)

        return {
            "sample_id": str(new_sample.sample_id),
            "sample_name": new_sample.sample_name,
            "sample_url": new_sample.sample_url,
            "upload_date": new_sample.upload_date
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Get all the samples a user has saved
@app.get("/user/saves/")
def getSavedSamples(user_id: str):
    return {}

# Save a samples for a user
@app.post("/user/saves/")
def saveSample(user_id: str, sample_id: str):
    return {}
