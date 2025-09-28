from typing import Union, List
from fastapi import FastAPI, UploadFile, HTTPException, Depends, Form
from pydantic import BaseModel
import uuid as uuid_lib
import s3_utils
from Models import Sample, SavedSample
from DBManager import SessionLocal, init_db, Base, engine
from sqlalchemy.orm import Session
#from helpers import analyze_audio
import json

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class SampleResponse(BaseModel):
    id: str
    name: str
    sample_url: str
    ext: str
    music_key: Union[str, None] = None
    bpm: Union[int, None] = None
    tags: List[str] = []

    class Config:
        orm_mode = True

class SavedSampleResponse(BaseModel):
    sample_id: str
    user_id: str
    save_date: str

class SaveSampleRequest(BaseModel):
    user_id: int
    sample_id: str


app = FastAPI()


# Get all the samples in the database and return an array of sample_ids
@app.get("/samples/", response_model=List[SampleResponse])
def getAllSamples(db: Session = Depends(get_db)):
    samples = db.query(Sample).all()
    result = [
        SampleResponse(
            id=str(s.sample_id),
            name=s.sample_name,
            sample_url=s.sample_url,
            ext=s.sample_name.split(".")[-1],
            music_key=s.musical_key,
            bpm=s.bpm,
            tags=s.tags or []
        )
        for s in samples
    ]
    return result

#get sample by id
@app.get("/samples/{sample_id}", response_model=SampleResponse)
def getSample(sample_id: str, db: Session = Depends(get_db)):
    sample = db.query(Sample).filter(Sample.sample_id == sample_id).first()
    if not sample:
        raise HTTPException(status_code=404, detail="Sample not found")
    
    return SampleResponse(
        id=str(sample.sample_id),
        name=sample.sample_name,
        sample_url=sample.sample_url,
        ext=sample.sample_name.split(".")[-1],
        music_key=sample.musical_key,
        bpm=sample.bpm,
        tags=sample.tags or []
    )

@app.post("/samples/", response_model=SampleResponse)
async def uploadSample(sampleFile: UploadFile, tags: str = Form(...), db: Session = Depends(get_db)):
    try:
        tag_list = json.loads(tags)
        # Generate UUID for S3 key & DB primary key
        sample_uuid = str(uuid_lib.uuid4())

        #bpm, musical_key = analyze_audio(sampleFile.file)

        # Reset file pointer after reading for librosa
        sampleFile.file.seek(0)

        # Upload to S3
        s3_url = s3_utils.upload_fileobj(
            file_obj=sampleFile.file,
            filename=sampleFile.filename,
            uuid=sample_uuid
        )

        # Insert into DB (fake uploader_id for demo)
        uploader_id = 1
        new_sample = Sample(
            sample_id=sample_uuid,
            sample_name=sampleFile.filename,
            sample_url=s3_url,
            tags=tag_list,
            uploader_id=uploader_id
        )

        db.add(new_sample)
        db.commit()
        db.refresh(new_sample)

        return SampleResponse(
            id=str(new_sample.sample_id),
            name=new_sample.sample_name,
            sample_url=new_sample.sample_url,
            ext=new_sample.sample_name.split(".")[-1],
            #music_key=new_sample.musical_key,
            #bpm=new_sample.bpm,
            tags=new_sample.tags or []
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Get all the samples a user has saved
@app.get("/user/saves/", response_model=List[SavedSampleResponse])
def getSavedSamples(user_id: str, db: Session = Depends(get_db)):
    saved = db.query(SavedSample).filter(SavedSample.user_id == user_id).all()
    return [
        SavedSampleResponse(
            sample_id=str(s.sample_id),
            user_id=str(s.user_id),
            save_date=s.save_date.isoformat()
        )
        for s in saved
    ]

@app.post("/user/saves/", response_model=SavedSampleResponse)
def saveSample(request: SaveSampleRequest, db: Session = Depends(get_db)):
    saved = SavedSample(user_id=request.user_id, sample_id=request.sample_id)
    db.add(saved)
    db.commit()
    db.refresh(saved)
    return SavedSampleResponse(
        sample_id=str(saved.sample_id),
        user_id=str(saved.user_id),
        save_date=saved.save_date.isoformat()
    )


@app.on_event("startup")
def on_startup():
    init_db()  # ensures all tables exist when FastAPI starts