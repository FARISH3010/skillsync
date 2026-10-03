from sqlalchemy import create_engine, Column, String, Integer, Float, Text, Boolean, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./skillsync.db")

# SQLite configuration compatible with multi-threading
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class TaxonomySkill(Base):
    __tablename__ = "taxonomy_skills"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    category = Column(String, nullable=False)
    aliases = Column(Text, nullable=False) # comma-separated
    importance_weight = Column(Float, default=1.0)
    recommended_module = Column(String, nullable=True)

class Curriculum(Base):
    __tablename__ = "curricula"
    
    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    institution = Column(String, nullable=False)
    academic_year = Column(String, nullable=False)
    raw_content = Column(Text, nullable=True)

class Course(Base):
    __tablename__ = "courses"
    
    id = Column(String, primary_key=True, index=True)
    curriculum_id = Column(String, ForeignKey("curricula.id"), nullable=False)
    code = Column(String, nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=False)

class JobPosting(Base):
    __tablename__ = "job_postings"
    
    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    company = Column(String, nullable=False)
    location = Column(String, nullable=False)
    experience = Column(String, nullable=True)
    description = Column(Text, nullable=False)

class ExtractedSkill(Base):
    __tablename__ = "extracted_skills"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    source_type = Column(String, nullable=False) # 'curriculum' or 'job'
    source_id = Column(String, nullable=False)
    skill_id = Column(String, ForeignKey("taxonomy_skills.id"), nullable=False)
    confidence = Column(Float, default=1.0)
    matched_mention = Column(String, nullable=True)

class CurriculumBenchmark(Base):
    __tablename__ = "curriculum_benchmarks"
    
    curriculum_id = Column(String, primary_key=True, index=True)
    domain_name = Column(String, nullable=False)
    benchmark_json = Column(Text, nullable=False)
    created_at = Column(String, nullable=False)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    Base.metadata.create_all(bind=engine)
