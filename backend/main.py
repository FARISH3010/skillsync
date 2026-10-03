import os
import json
import uuid
import logging
import re
import requests
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

from fastapi import FastAPI, Depends, HTTPException, Query, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session

import datetime
from models import init_db, get_db, TaxonomySkill, Curriculum, Course, JobPosting, ExtractedSkill, CurriculumBenchmark
from extractor import SkillExtractor, DocumentParser
from analytics import AnalyticsEngine

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("SkillSyncAPI")

app = FastAPI(
    title="SkillSync Curriculum-Intelligence Platform API",
    description="Continuously compare academic curricula with current industry skill demands, identify gaps, and provide actionable recommendations.",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global in-memory cache for dynamic domain benchmarks
DOMAIN_BENCHMARKS_CACHE: Dict[str, Any] = {}

def get_taxonomy_data(db: Optional[Session] = None):
    taxonomy_file = os.path.join(os.path.dirname(__file__), "skill_taxonomy.json")
    with open(taxonomy_file, "r") as f:
        base_tax = json.load(f)
    
    if db is not None:
        try:
            db_skills = db.query(TaxonomySkill).all()
            base_ids = {item["id"] for item in base_tax}
            for ds in db_skills:
                if ds.id not in base_ids:
                    base_tax.append({
                        "id": ds.id,
                        "name": ds.name,
                        "category": ds.category,
                        "aliases": [a.strip() for a in ds.aliases.split(",") if a.strip()],
                        "importance_weight": ds.importance_weight,
                        "recommended_module": ds.recommended_module or f"Applied {ds.name} Practicum"
                    })
        except Exception:
            pass
    return base_tax

def seed_sample_curricula(db: Session, extractor: SkillExtractor):
    """
    Pre-seeds 3 rich sample curricula:
    1. curr_cs_2024 (Computer Science)
    2. curr_aids_2024 (AI & Data Science)
    3. curr_fullstack_2024 (Full Stack Engineering)
    """
    sample_files = [
        os.path.join(os.path.dirname(__file__), "..", "sample_data", "curriculum_syllabus.json"),
        os.path.join(os.path.dirname(__file__), "..", "sample_data", "curriculum_ai_ds_2024.json"),
        os.path.join(os.path.dirname(__file__), "..", "sample_data", "curriculum_fullstack_2024.json")
    ]
    
    for s_file in sample_files:
        if os.path.exists(s_file):
            with open(s_file, "r") as f:
                curr_data = json.load(f)
            
            c_id = curr_data.get("id", f"curr_{uuid.uuid4().hex[:6]}")
            existing = db.query(Curriculum).filter(Curriculum.id == c_id).first()
            if not existing:
                curr = Curriculum(
                    id=c_id,
                    title=curr_data["curriculum_title"],
                    institution=curr_data["institution"],
                    academic_year=curr_data["academic_year"],
                    raw_content=json.dumps(curr_data)
                )
                db.add(curr)
                db.commit()

                for c in curr_data.get("courses", []):
                    course_id = f"{c_id}_{c['code']}"
                    course = Course(
                        id=course_id,
                        curriculum_id=c_id,
                        code=c["code"],
                        name=c["name"],
                        description=c["description"]
                    )
                    db.add(course)
                    
                    extracted = extractor.extract_from_text(f"{c['name']} {c['description']}", use_llm=False)
                    for ext in extracted:
                        db_ext = ExtractedSkill(
                            source_type="curriculum",
                            source_id=c_id, # associate with curriculum id
                            skill_id=ext["skill_id"],
                            confidence=ext["confidence"],
                            matched_mention=ext["matched_mention"]
                        )
                        db.add(db_ext)
                db.commit()

def seed_sample_jobs(db: Session, extractor: SkillExtractor):
    sample_jobs_file = os.path.join(os.path.dirname(__file__), "..", "sample_data", "job_postings.json")
    if os.path.exists(sample_jobs_file):
        with open(sample_jobs_file, "r") as f:
            jobs_data = json.load(f)
        
        for j in jobs_data:
            existing = db.query(JobPosting).filter(JobPosting.id == j["id"]).first()
            if not existing:
                job = JobPosting(
                    id=j["id"],
                    title=j["title"],
                    company=j["company"],
                    location=j["location"],
                    experience=j["experience"],
                    description=j["description"]
                )
                db.add(job)
                
                extracted = extractor.extract_from_text(f"{j['title']} {j['description']}", use_llm=False)
                for ext in extracted:
                    db_ext = ExtractedSkill(
                        source_type="job",
                        source_id=j["id"],
                        skill_id=ext["skill_id"],
                        confidence=ext["confidence"],
                        matched_mention=ext["matched_mention"]
                    )
                    db.add(db_ext)
        db.commit()

# Startup event: Initialize database and seed MVP data
@app.on_event("startup")
def startup_event():
    init_db()
    taxonomy_data = get_taxonomy_data()
    extractor = SkillExtractor(taxonomy_data)
    
    from models import SessionLocal
    db = SessionLocal()
    try:
        # Sync taxonomy skills
        for item in taxonomy_data:
            existing = db.query(TaxonomySkill).filter(TaxonomySkill.id == item["id"]).first()
            if not existing:
                db_skill = TaxonomySkill(
                    id=item["id"],
                    name=item["name"],
                    category=item["category"],
                    aliases=",".join(item.get("aliases", [])),
                    importance_weight=item.get("importance_weight", 1.0),
                    recommended_module=item.get("recommended_module", "")
                )
                db.add(db_skill)
        db.commit()

        # Seed sample curricula
        seed_sample_curricula(db, extractor)

        # Seed sample jobs
        seed_sample_jobs(db, extractor)
    finally:
        db.close()


class SimulationRequest(BaseModel):
    curriculum_id: Optional[str] = "curr_cs_2024"
    simulated_skill_ids: List[str]


@app.get("/health")
def health_check():
    return {
        "status": "ok", 
        "app": "SkillSync Curriculum-Intelligence Platform",
        "version": "2.0.0",
        "gemini_active": bool(os.getenv("GEMINI_API_KEY"))
    }


@app.get("/curricula")
def list_curricula(db: Session = Depends(get_db)):
    """
    Returns all available curricula (sample and user-uploaded).
    """
    curricula = db.query(Curriculum).all()
    results = []
    for c in curricula:
        course_count = db.query(Course).filter(Course.curriculum_id == c.id).count()
        results.append({
            "id": c.id,
            "title": c.title,
            "institution": c.institution,
            "academic_year": c.academic_year,
            "course_count": course_count
        })
    return results


@app.get("/dashboard/gaps")
def get_dashboard_gaps(curriculum_id: str = "curr_cs_2024", db: Session = Depends(get_db)):
    """
    Retrieve overall skill gap metrics, coverage score, priority gaps and taxonomy breakdown.
    """
    curr = db.query(Curriculum).filter(Curriculum.id == curriculum_id).first()
    if not curr:
        # Fallback to first curriculum if curr_cs_2024 isn't found
        curr = db.query(Curriculum).first()
        if not curr:
            raise HTTPException(status_code=404, detail="No curricula found")
        curriculum_id = curr.id

    taxonomy_data = get_taxonomy_data(db)

    # Get all distinct skills taught in this specific curriculum
    curr_skills_records = db.query(ExtractedSkill.skill_id)\
        .filter(ExtractedSkill.source_type == "curriculum", ExtractedSkill.source_id == curriculum_id)\
        .distinct().all()
    curriculum_skills = [r[0] for r in curr_skills_records]

    # Get job skills grouped by job
    job_records = db.query(JobPosting.id).all()
    job_ids = [j[0] for j in job_records]

    job_extractions = []
    for j_id in job_ids:
        skills = db.query(ExtractedSkill.skill_id)\
            .filter(ExtractedSkill.source_type == "job", ExtractedSkill.source_id == j_id)\
            .all()
        job_extractions.append([s[0] for s in skills])

    # Check if this curriculum has dynamic non-CS skills
    has_dynamic_skills = any(s.startswith("sk_dyn_") for s in curriculum_skills)
    is_non_cs = has_dynamic_skills or ("law" in curr.title.lower() or "ll.b" in curr.title.lower() or "llb" in curr.title.lower() or "mba" in curr.title.lower() or "medical" in curr.title.lower() or "arts" in curr.title.lower())
    
    if is_non_cs and bool(os.getenv("GEMINI_API_KEY")):
        extractor = SkillExtractor(taxonomy_data)
        # Fetch extracted skills objects
        ext_objects = db.query(ExtractedSkill, TaxonomySkill)\
            .join(TaxonomySkill, ExtractedSkill.skill_id == TaxonomySkill.id)\
            .filter(ExtractedSkill.source_type == "curriculum", ExtractedSkill.source_id == curriculum_id)\
            .all()
        
        if curriculum_id in DOMAIN_BENCHMARKS_CACHE:
            domain_bench = DOMAIN_BENCHMARKS_CACHE[curriculum_id]
        else:
            # Check SQLite persistent cache first
            saved_bench = db.query(CurriculumBenchmark).filter(CurriculumBenchmark.curriculum_id == curriculum_id).first()
            if saved_bench:
                try:
                    domain_bench = json.loads(saved_bench.benchmark_json)
                    DOMAIN_BENCHMARKS_CACHE[curriculum_id] = domain_bench
                except Exception:
                    domain_bench = None
            else:
                domain_bench = None

            if not domain_bench:
                extracted_skills_list = [{"skill_name": tax.name, "category": tax.category} for ext, tax in ext_objects]
                domain_bench = extractor.generate_domain_market_benchmark(curr.title, extracted_skills_list)
                if domain_bench:
                    DOMAIN_BENCHMARKS_CACHE[curriculum_id] = domain_bench
                    # Persist to SQLite
                    try:
                        new_saved = CurriculumBenchmark(
                            curriculum_id=curriculum_id,
                            domain_name=domain_bench.get("domain_name", "Professional Field"),
                            benchmark_json=json.dumps(domain_bench),
                            created_at=datetime.datetime.utcnow().isoformat()
                        )
                        db.merge(new_saved)
                        db.commit()
                    except Exception as e:
                        logger.warning(f"Could not persist benchmark to SQLite: {e}")
        
        if domain_bench and domain_bench.get("market_demand_skills"):
            market_skills = domain_bench.get("market_demand_skills", [])
            domain_name = domain_bench.get("domain_name", "Professional Field")
            recommendations_list = domain_bench.get("actionable_recommendations", [])
            roles = domain_bench.get("simulated_market_roles", ["Associate Professional", "Specialist Consultant"])

            # Compute mathematically sound weighted alignment score:
            # Sum(covered * weight * demand) / Sum(weight * demand) * 100
            total_weight_demand = 0.0
            covered_weight_demand = 0.0
            for s in market_skills:
                w = float(s.get("importance_weight", 1.0))
                d = float(s.get("market_demand_pct", 75.0))
                factor = w * d
                total_weight_demand += factor
                if s.get("in_curriculum", False):
                    covered_weight_demand += factor

            if total_weight_demand > 0:
                alignment_pct = round((covered_weight_demand / total_weight_demand) * 100, 1)
            else:
                alignment_pct = float(domain_bench.get("current_alignment_pct", 50.0))
            
            # Format skills list
            formatted_skills = []
            for s in market_skills:
                is_cov = s.get("in_curriculum", False)
                demand_pct = s.get("market_demand_pct", 75.0)
                status = "COVERED" if is_cov else ("CRITICAL_GAP" if demand_pct >= 60 else "MODERATE_GAP")
                priority = "LOW" if is_cov else ("HIGH" if demand_pct >= 60 else "MEDIUM")
                formatted_skills.append({
                    "skill_id": f"sk_dom_{re.sub(r'[^a-zA-Z0-9]+', '_', s['name'].lower())[:20]}",
                    "name": s["name"],
                    "category": s.get("category", domain_name),
                    "market_frequency_pct": demand_pct,
                    "demand_score": demand_pct,
                    "in_curriculum": is_cov,
                    "is_simulated": False,
                    "is_covered": is_cov,
                    "gap_score": 0.0 if is_cov else demand_pct,
                    "priority": priority,
                    "status": status,
                    "recommended_module": s.get("recommended_module", f"Applied {s['name']} Practicum")
                })
            
            critical_count = sum(1 for fs in formatted_skills if fs["status"] == "CRITICAL_GAP")
            moderate_count = sum(1 for fs in formatted_skills if fs["status"] == "MODERATE_GAP")
            
            # Category breakdown
            cat_breakdown = {}
            for fs in formatted_skills:
                c = fs["category"]
                if c not in cat_breakdown:
                    cat_breakdown[c] = {"total_skills": 0, "covered_skills": 0, "coverage_pct": 0.0}
                cat_breakdown[c]["total_skills"] += 1
                if fs["is_covered"]:
                    cat_breakdown[c]["covered_skills"] += 1
            for c in cat_breakdown:
                tot = cat_breakdown[c]["total_skills"]
                cov = cat_breakdown[c]["covered_skills"]
                cat_breakdown[c]["coverage_pct"] = round((cov / tot) * 100, 1) if tot > 0 else 0.0
            
            analysis = {
                "summary": {
                    "overall_coverage_pct": alignment_pct,
                    "baseline_coverage_pct": alignment_pct,
                    "simulated_gain_pct": 0.0,
                    "total_industry_jobs_analyzed": len(roles) * 5,
                    "total_skills_tracked": len(formatted_skills),
                    "total_gaps_identified": critical_count + moderate_count,
                    "critical_gaps_count": critical_count,
                    "moderate_gaps_count": moderate_count,
                    "domain_name": domain_name,
                    "executive_summary": domain_bench.get("executive_summary", "")
                },
                "category_breakdown": cat_breakdown,
                "skills": formatted_skills,
                "recommendations": recommendations_list,
                "market_roles": roles,
                "portfolio_projects": domain_bench.get("portfolio_projects", []),
                "sample_job_postings": domain_bench.get("sample_job_postings", [])
            }
            analysis["curriculum"] = {
                "id": curr.id,
                "title": curr.title,
                "institution": curr.institution,
                "academic_year": curr.academic_year
            }
            return analysis

    # Standard fallback path for technical / IT curricula
    analysis = AnalyticsEngine.compute_gap_analysis(
        taxonomy=taxonomy_data,
        curriculum_skills=curriculum_skills,
        job_postings_extractions=job_extractions
    )
    analysis["curriculum"] = {
        "id": curr.id,
        "title": curr.title,
        "institution": curr.institution,
        "academic_year": curr.academic_year
    }
    return analysis


@app.get("/curriculum/{curriculum_id}/skills")
def get_curriculum_skills(curriculum_id: str, db: Session = Depends(get_db)):
    """
    Fetch mapped skills and course associations for a specific curriculum.
    """
    curr = db.query(Curriculum).filter(Curriculum.id == curriculum_id).first()
    if not curr:
        curr = db.query(Curriculum).first()
        if not curr:
            raise HTTPException(status_code=404, detail="Curriculum not found")
        curriculum_id = curr.id

    courses = db.query(Course).filter(Course.curriculum_id == curriculum_id).all()
    taxonomy_data = get_taxonomy_data(db)
    extractor = SkillExtractor(taxonomy_data)
    
    result = []
    for c in courses:
        # Extract skills for course display
        extracted_skills = extractor.extract_from_text(f"{c.name} {c.description}", use_llm=False)
        result.append({
            "code": c.code,
            "name": c.name,
            "description": c.description,
            "mapped_skills": extracted_skills
        })
    
    return {
        "curriculum_id": curriculum_id,
        "title": curr.title,
        "institution": curr.institution,
        "academic_year": curr.academic_year,
        "courses": result
    }


@app.get("/jobs")
def get_job_postings(curriculum_id: Optional[str] = None, db: Session = Depends(get_db)):
    """
    Fetch job postings sample and their extracted industry skill tags.
    If curriculum_id is provided and has dynamic domain benchmarks, returns discipline-specific postings.
    """
    # Check for live job search via RapidAPI JSearch (LinkedIn job engine) if API key configured
    rapidapi_key = os.getenv("RAPIDAPI_KEY") or os.getenv("JSEARCH_API_KEY")
    if curriculum_id and rapidapi_key:
        curr = db.query(Curriculum).filter(Curriculum.id == curriculum_id).first()
        search_query = curr.title if curr else "Professional"
        try:
            url = "https://jsearch.p.rapidapi.com/search"
            headers = {
                "X-RapidAPI-Key": rapidapi_key,
                "X-RapidAPI-Host": "jsearch.p.rapidapi.com"
            }
            params = {
                "query": f"{search_query} jobs in India",
                "page": "1",
                "num_pages": "1"
            }
            res = requests.get(url, headers=headers, params=params, timeout=5)
            if res.status_code == 200:
                data = res.json().get("data", [])
                if data:
                    taxonomy_data = get_taxonomy_data(db)
                    extractor = SkillExtractor(taxonomy_data)
                    live_results = []
                    for idx, j in enumerate(data[:10]):
                        desc = j.get("job_description", "")
                        extracted = extractor.extract_from_text(f"{j.get('job_title', '')} {desc[:600]}", use_llm=False)
                        live_results.append({
                            "id": f"live_job_{idx+1}",
                            "title": j.get("job_title", "Professional"),
                            "company": j.get("employer_name", "Leading Enterprise"),
                            "location": f"{j.get('job_city', '')}, {j.get('job_country', 'India')}".strip(", "),
                            "experience": j.get("job_required_experience", {}).get("required_experience_in_months") or "0-2 Yrs",
                            "description": desc[:300] + "..." if len(desc) > 300 else desc,
                            "extracted_skills": extracted or []
                        })
                    return live_results
        except Exception as e:
            logger.warning(f"Live JSearch API query failed, falling back to benchmark/local: {e}")

    if curriculum_id:
        if curriculum_id not in DOMAIN_BENCHMARKS_CACHE:
            # Check if this is a non-cs or uploaded curriculum and trigger gap analysis to populate cache
            curr = db.query(Curriculum).filter(Curriculum.id == curriculum_id).first()
            if curr:
                curr_skills_records = db.query(ExtractedSkill.skill_id)\
                    .filter(ExtractedSkill.source_type == "curriculum", ExtractedSkill.source_id == curriculum_id)\
                    .distinct().all()
                curriculum_skills = [r[0] for r in curr_skills_records]
                has_dynamic = any(s.startswith("sk_dyn_") for s in curriculum_skills) or ("law" in curr.title.lower() or "ll.b" in curr.title.lower() or "llb" in curr.title.lower() or "bio" in curr.title.lower() or "mba" in curr.title.lower() or "medical" in curr.title.lower() or "arts" in curr.title.lower())
                if has_dynamic:
                    get_dashboard_gaps(curriculum_id=curriculum_id, db=db)

        if curriculum_id in DOMAIN_BENCHMARKS_CACHE:
            domain_bench = DOMAIN_BENCHMARKS_CACHE[curriculum_id]
            sample_jobs = domain_bench.get("sample_job_postings", [])
            if sample_jobs:
                results = []
                for idx, sj in enumerate(sample_jobs):
                    skills_list = []
                    for sk in sj.get("extracted_skills", []):
                        sk_name = sk if isinstance(sk, str) else sk.get("name", "")
                        skills_list.append({
                            "skill_id": f"sk_job_{idx}_{re.sub(r'[^a-zA-Z0-9]+', '_', sk_name.lower())[:15]}",
                            "skill_name": sk_name,
                            "category": domain_bench.get("domain_name", "Professional Practice"),
                            "matched_mention": sk_name
                        })
                    results.append({
                        "id": f"job_dyn_{idx+1}",
                        "title": sj.get("title", "Associate Professional"),
                        "company": sj.get("company", "Industry Leader"),
                        "location": sj.get("location", "National / Hybrid"),
                        "experience": sj.get("experience", "0-2 Yrs"),
                        "description": sj.get("description", "Responsible for day-to-day legal or analytical operations."),
                        "extracted_skills": skills_list
                    })
                return results

    jobs = db.query(JobPosting).all()
    results = []
    for j in jobs:
        extracted = db.query(ExtractedSkill, TaxonomySkill)\
            .join(TaxonomySkill, ExtractedSkill.skill_id == TaxonomySkill.id)\
            .filter(ExtractedSkill.source_type == "job", ExtractedSkill.source_id == j.id)\
            .all()
        
        skills = [
            {
                "skill_id": tax.id,
                "skill_name": tax.name,
                "category": tax.category,
                "matched_mention": ext.matched_mention
            }
            for ext, tax in extracted
        ]
        results.append({
            "id": j.id,
            "title": j.title,
            "company": j.company,
            "location": j.location,
            "experience": j.experience,
            "description": j.description,
            "extracted_skills": skills
        })
    return results


@app.post("/simulator/what-if")
def simulate_what_if(req: SimulationRequest, db: Session = Depends(get_db)):
    """
    Simulate what happens when elective modules or new skills are integrated into curriculum.
    Instantly recalculates coverage, gap closures, and projected market readiness.
    """
    curr = db.query(Curriculum).filter(Curriculum.id == req.curriculum_id).first()
    if not curr:
        curr = db.query(Curriculum).first()
        if not curr:
            raise HTTPException(status_code=404, detail="Curriculum not found")
        req.curriculum_id = curr.id

    taxonomy_data = get_taxonomy_data(db)

    curr_skills_records = db.query(ExtractedSkill.skill_id)\
        .filter(ExtractedSkill.source_type == "curriculum", ExtractedSkill.source_id == req.curriculum_id)\
        .distinct().all()
    curriculum_skills = [r[0] for r in curr_skills_records]

    job_records = db.query(JobPosting.id).all()
    job_ids = [j[0] for j in job_records]

    job_extractions = []
    for j_id in job_ids:
        skills = db.query(ExtractedSkill.skill_id)\
            .filter(ExtractedSkill.source_type == "job", ExtractedSkill.source_id == j_id)\
            .all()
        job_extractions.append([s[0] for s in skills])

    # If curriculum has a cached domain benchmark, use dynamic simulation
    if req.curriculum_id in DOMAIN_BENCHMARKS_CACHE:
        domain_bench = DOMAIN_BENCHMARKS_CACHE[req.curriculum_id]
        market_skills = domain_bench.get("market_demand_skills", [])
        domain_name = domain_bench.get("domain_name", "Professional Field")
        base_alignment = float(domain_bench.get("current_alignment_pct", 50.0))
        recommendations_list = domain_bench.get("actionable_recommendations", [])
        roles = domain_bench.get("simulated_market_roles", ["Associate Professional", "Specialist Consultant"])

        formatted_skills = []
        covered_count = 0
        total_market_skills = len(market_skills)

        for s in market_skills:
            skill_id = f"sk_dom_{re.sub(r'[^a-zA-Z0-9]+', '_', s['name'].lower())[:20]}"
            is_curriculum_covered = s.get("in_curriculum", False)
            is_sim = skill_id in req.simulated_skill_ids
            is_now_covered = is_curriculum_covered or is_sim
            if is_now_covered:
                covered_count += 1

            demand_pct = s.get("market_demand_pct", 75.0)
            status = "COVERED" if is_now_covered else ("CRITICAL_GAP" if demand_pct >= 60 else "MODERATE_GAP")
            priority = "LOW" if is_now_covered else ("HIGH" if demand_pct >= 60 else "MEDIUM")

            formatted_skills.append({
                "skill_id": skill_id,
                "name": s["name"],
                "category": s.get("category", domain_name),
                "market_frequency_pct": demand_pct,
                "demand_score": demand_pct,
                "in_curriculum": is_curriculum_covered,
                "is_simulated": is_sim,
                "is_covered": is_now_covered,
                "gap_score": 0.0 if is_now_covered else demand_pct,
                "priority": priority,
                "status": status,
                "recommended_module": s.get("recommended_module", f"Applied {s['name']} Practicum")
            })

        critical_count = sum(1 for fs in formatted_skills if fs["status"] == "CRITICAL_GAP")
        moderate_count = sum(1 for fs in formatted_skills if fs["status"] == "MODERATE_GAP")

        # Calculate updated simulated coverage
        simulated_coverage = round((covered_count / total_market_skills) * 100, 1) if total_market_skills > 0 else base_alignment
        simulated_gain = round(max(0.0, simulated_coverage - base_alignment), 1)

        cat_breakdown = {}
        for fs in formatted_skills:
            c = fs["category"]
            if c not in cat_breakdown:
                cat_breakdown[c] = {"total_skills": 0, "covered_skills": 0, "coverage_pct": 0.0}
            cat_breakdown[c]["total_skills"] += 1
            if fs["is_covered"]:
                cat_breakdown[c]["covered_skills"] += 1
        for c in cat_breakdown:
            tot = cat_breakdown[c]["total_skills"]
            cov = cat_breakdown[c]["covered_skills"]
            cat_breakdown[c]["coverage_pct"] = round((cov / tot) * 100, 1) if tot > 0 else 0.0

        return {
            "summary": {
                "overall_coverage_pct": simulated_coverage,
                "baseline_coverage_pct": base_alignment,
                "simulated_gain_pct": simulated_gain,
                "total_industry_jobs_analyzed": len(roles) * 5,
                "total_skills_tracked": len(formatted_skills),
                "total_gaps_identified": critical_count + moderate_count,
                "critical_gaps_count": critical_count,
                "moderate_gaps_count": moderate_count,
                "domain_name": domain_name,
                "executive_summary": domain_bench.get("executive_summary", "")
            },
            "category_breakdown": cat_breakdown,
            "skills": formatted_skills,
            "recommendations": recommendations_list,
            "market_roles": roles
        }

    simulation_result = AnalyticsEngine.compute_gap_analysis(
        taxonomy=taxonomy_data,
        curriculum_skills=curriculum_skills,
        job_postings_extractions=job_extractions,
        simulated_additional_skills=req.simulated_skill_ids
    )

    return simulation_result


@app.get("/recommendations")
def get_recommendations(curriculum_id: str = "curr_cs_2024", db: Session = Depends(get_db)):
    """
    Fetch prioritized actionable suggestions (modules, workshops, labs) to bridge identified gaps.
    """
    gap_data = get_dashboard_gaps(curriculum_id=curriculum_id, db=db)
    return {
        "curriculum_id": curriculum_id,
        "recommendations": gap_data["recommendations"],
        "critical_gaps_count": gap_data["summary"]["critical_gaps_count"],
        "overall_coverage_pct": gap_data["summary"]["overall_coverage_pct"]
    }


# Live Dynamic Document Ingestion Endpoints (PDF / DOCX / JSON)
@app.post("/upload/curriculum")
async def upload_curriculum(
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    institution: Optional[str] = Form(None),
    academic_year: Optional[str] = Form("2024-2025"),
    db: Session = Depends(get_db)
):
    """
    Upload and parse syllabus PDF or DOCX file on the fly.
    Extracts structured text, identifies skills with Hybrid Extractor (spaCy + Gemini + Taxonomy),
    and registers the curriculum into the database for immediate analysis.
    """
    content_bytes = await file.read()
    filename = file.filename or "uploaded_syllabus.pdf"
    
    # 1. Parse text from PDF/DOCX
    raw_text = DocumentParser.parse_document(content_bytes, filename)
    if not raw_text.strip():
        raise HTTPException(status_code=400, detail="Failed to extract readable text from document.")

    # 2. Extract technical skills
    taxonomy_data = get_taxonomy_data(db)
    extractor = SkillExtractor(taxonomy_data)
    extracted_skills = extractor.extract_from_text(raw_text, use_llm=True)

    # 3. Create Curriculum Record
    curr_id = f"curr_up_{uuid.uuid4().hex[:8]}"
    curr_title = title or filename.rsplit(".", 1)[0].replace("_", " ").title()
    curr_inst = institution or "Uploaded Institution"

    curr = Curriculum(
        id=curr_id,
        title=curr_title,
        institution=curr_inst,
        academic_year=academic_year or "2024-2025",
        raw_content=raw_text[:20000]
    )
    db.add(curr)
    db.commit()

    # 4. Generate structured Course representations from syllabus
    parsed_courses = extractor.parse_curriculum_courses(raw_text, curr_title)
    if parsed_courses:
        for idx, pc in enumerate(parsed_courses):
            c_code = pc.get("code") or f"MOD-{idx+1:02d}"
            c_name = pc.get("name") or f"Module {idx+1}"
            course = Course(
                id=f"{curr_id}_{c_code}_{idx}",
                curriculum_id=curr_id,
                code=c_code,
                name=c_name,
                description=pc.get("description", "")[:600]
            )
            db.add(course)
    else:
        course = Course(
            id=f"{curr_id}_ALL",
            curriculum_id=curr_id,
            code="SYL-01",
            name="Comprehensive Syllabus Course Content",
            description=raw_text[:500]
        )
        db.add(course)

    # 5. Save Extracted Skills & Ensure in Taxonomy
    for ext in extracted_skills:
        # If skill is not in database taxonomy, register it dynamically
        existing_tax = db.query(TaxonomySkill).filter(TaxonomySkill.id == ext["skill_id"]).first()
        if not existing_tax:
            new_tax = TaxonomySkill(
                id=ext["skill_id"],
                name=ext["skill_name"],
                category=ext["category"],
                aliases=ext["matched_mention"],
                importance_weight=ext.get("importance_weight", 0.9),
                recommended_module=f"Applied {ext['skill_name']} Practicum"
            )
            db.add(new_tax)
            db.flush()

        db_ext = ExtractedSkill(
            source_type="curriculum",
            source_id=curr_id,
            skill_id=ext["skill_id"],
            confidence=ext["confidence"],
            matched_mention=ext["matched_mention"]
        )
        db.add(db_ext)

    db.commit()

    # 6. Compute instantaneous gap analysis
    return {
        "success": True,
        "message": f"Successfully ingested {filename}",
        "curriculum_id": curr_id,
        "title": curr_title,
        "extracted_skills_count": len(extracted_skills),
        "extracted_skills": extracted_skills
    }


# Backwards compatibility alias
@app.post("/curriculum/upload")
async def upload_curriculum_alias(
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    institution: Optional[str] = Form(None),
    academic_year: Optional[str] = Form("2024-2025"),
    db: Session = Depends(get_db)
):
    return await upload_curriculum(file, title, institution, academic_year, db)
