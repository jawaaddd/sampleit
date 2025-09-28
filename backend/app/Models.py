import uuid
from sqlalchemy import (
    Column, String, Integer, ForeignKey, TIMESTAMP,
    func, Enum, Table, UniqueConstraint, text
)
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import relationship, declarative_base
from DBManager import Base

musical_keys = (
    'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F',
    'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B',
    'Cm', 'C#m', 'Dbm', 'Dm', 'D#m', 'Ebm', 'Em', 'Fm',
    'F#m', 'Gbm', 'Gm', 'G#m', 'Abm', 'Am', 'A#m', 'Bbm', 'Bm'
)
MusicalKey = Enum(*musical_keys, name="musicalkey")

class User(Base):
    __tablename__ = "users"

    user_id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()")
    )
    username = Column(String(50), unique=True, nullable=False)
    password = Column(String(255), nullable=False)

    # relationships
    samples = relationship("Sample", back_populates="uploader")
    saved_samples = relationship("SavedSample", back_populates="user")


class Sample(Base):
    __tablename__ = "samples"

    sample_id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()")
    )
    bpm = Column(Integer)
    sample_name = Column(String(255), nullable=False)
    sample_url = Column(String(500))
    musical_key = Column(MusicalKey)
    tags = Column(ARRAY(String(50)))
    uploader_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.user_id", ondelete="SET NULL"),
        nullable=True
    )
    upload_date = Column(TIMESTAMP, server_default=func.now())

    # relationships
    uploader = relationship("User", back_populates="samples")
    saved_by = relationship("SavedSample", back_populates="sample")

class SavedSample(Base):
    __tablename__ = "saved_samples"

    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.user_id", ondelete="CASCADE"),
        primary_key=True
    )
    sample_id = Column(
        UUID(as_uuid=True),
        ForeignKey("samples.sample_id", ondelete="CASCADE"),
        primary_key=True
    )
    save_date = Column(TIMESTAMP, server_default=func.now())

    # relationships
    user = relationship("User", back_populates="saved_samples")
    sample = relationship("Sample", back_populates="saved_by")
