import io
import re
import os
import json
import logging
from typing import List, Dict, Any, Optional

# Text processing & NLP libraries
try:
    import spacy
    nlp = spacy.load("en_core_web_sm")
except Exception as e:
    nlp = None
    logging.warning(f"spaCy en_core_web_sm not loaded: {e}. Falling back to basic regex cleaning.")

# Document extractors
try:
    from pypdf import PdfReader
except ImportError:
    PdfReader = None

try:
    import pdfplumber
except ImportError:
    pdfplumber = None

try:
    import docx
except ImportError:
    docx = None

# Google Generative AI
try:
    import google.generativeai as genai
except ImportError:
    genai = None

logger = logging.getLogger("SkillExtractor")

class DocumentParser:
    """
    Parses raw PDF and DOCX files into clean, structured text.
    """
    @staticmethod
    def extract_text_from_pdf(file_bytes: bytes) -> str:
        text_content = []
        
        # Method 1: Try pdfplumber for high-fidelity layout extraction
        if pdfplumber is not None:
            try:
                with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
                    for page in pdf.pages:
                        page_text = page.extract_text()
                        if page_text:
                            text_content.append(page_text)
                if text_content:
                    return "\n".join(text_content)
            except Exception as e:
                logger.warning(f"pdfplumber extraction failed, trying pypdf: {e}")
        
        # Method 2: Try pypdf fallback
        if PdfReader is not None:
            try:
                reader = PdfReader(io.BytesIO(file_bytes))
                for page in reader.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text_content.append(page_text)
                if text_content:
                    return "\n".join(text_content)
            except Exception as e:
                logger.warning(f"pypdf extraction failed: {e}")

        # Method 3: UTF-8 decoded fallback string
        try:
            return file_bytes.decode('utf-8', errors='ignore')
        except Exception:
            return ""

    @staticmethod
    def extract_text_from_docx(file_bytes: bytes) -> str:
        if docx is not None:
            try:
                doc = docx.Document(io.BytesIO(file_bytes))
                paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
                for table in doc.tables:
                    for row in table.rows:
                        row_text = [cell.text.strip() for cell in row.cells if cell.text.strip()]
                        if row_text:
                            paragraphs.append(" | ".join(row_text))
                return "\n".join(paragraphs)
            except Exception as e:
                logger.warning(f"python-docx extraction failed: {e}")
        
        try:
            return file_bytes.decode('utf-8', errors='ignore')
        except Exception:
            return ""

    @staticmethod
    def parse_document(file_bytes: bytes, filename: str) -> str:
        fname = filename.lower()
        if fname.endswith(".pdf"):
            return DocumentParser.extract_text_from_pdf(file_bytes)
        elif fname.endswith(".docx") or fname.endswith(".doc"):
            return DocumentParser.extract_text_from_docx(file_bytes)
        else:
            try:
                return file_bytes.decode('utf-8', errors='ignore')
            except Exception:
                return ""


class SkillExtractor:
    """
    Hybrid Skill Extraction and Normalization Engine:
    1. spaCy text cleaning, tokenization, phrase chunking, and stop-word filtering
    2. Deterministic taxonomy regex & token boundary matching
    3. Gemini API LLM semantic extraction for implicit concepts & emerging tools
    4. Confidence fusion & taxonomy normalization
    """
    def __init__(self, taxonomy: List[Dict[str, Any]], gemini_api_key: Optional[str] = None):
        self.taxonomy = taxonomy
        self.taxonomy_by_id = {item["id"]: item for item in taxonomy}
        self.gemini_api_key = gemini_api_key or os.getenv("GEMINI_API_KEY")
        
        # Setup Gemini if API key is provided
        self.gemini_model = None
        if self.gemini_api_key and genai is not None:
            try:
                genai.configure(api_key=self.gemini_api_key)
                for m_name in ["gemini-3.5-flash-lite", "gemini-3.5-flash", "gemini-3.8-flash"]:
                    try:
                        self.gemini_model = genai.GenerativeModel(m_name)
                        logger.info(f"Gemini API initialized with model '{m_name}' for semantic skill extraction.")
                        break
                    except Exception:
                        continue
            except Exception as e:
                logger.warning(f"Failed to initialize Gemini API: {e}")

        # Precompile aliases for token boundary regex matching
        self.compiled_rules = []
        for item in taxonomy:
            skill_id = item["id"]
            aliases = item.get("aliases", [])
            patterns = []
            for alias in aliases:
                escaped = re.escape(alias.strip().lower())
                # Allow word boundary or boundary punctuation like c++, .js, etc.
                pattern = rf"(?:\b|_){escaped}(?:\b|_)"
                patterns.append(re.compile(pattern, re.IGNORECASE))
            self.compiled_rules.append((item, patterns))

    def clean_text_with_spacy(self, text: str) -> str:
        """
        Cleans text using spaCy: removes noise, normalizes whitespace, preserves key technical tokens.
        """
        if not text:
            return ""
        if nlp is None:
            return re.sub(r'\s+', ' ', text).strip()
        
        doc = nlp(text[:25000]) # Cap to avoid massive docs
        tokens = []
        for token in doc:
            if not token.is_space:
                tokens.append(token.text)
        return " ".join(tokens)

    def extract_deterministic(self, text: str) -> List[Dict[str, Any]]:
        """
        Matches text against compiled taxonomy regex patterns.
        """
        if not text:
            return []
        
        matches = []
        lowered_text = text.lower()
        
        for item, patterns in self.compiled_rules:
            for pat in patterns:
                m = pat.search(lowered_text)
                if m:
                    matches.append({
                        "skill_id": item["id"],
                        "skill_name": item["name"],
                        "category": item["category"],
                        "importance_weight": item.get("importance_weight", 1.0),
                        "matched_mention": m.group(0).strip(),
                        "confidence": 0.95,
                        "extraction_source": "taxonomy_regex"
                    })
                    break
        return matches

    def extract_with_gemini(self, text: str) -> List[Dict[str, Any]]:
        """
        Leverages Gemini 1.5/2.0 API to extract technical skills and map them to taxonomy.
        """
        if not self.gemini_model or not text.strip():
            return []
        
        taxonomy_names = [item["name"] for item in self.taxonomy]
        prompt = f"""
You are an expert curriculum and professional competency analyzer.
Read the following academic or professional syllabus text carefully and extract ALL relevant competencies, subjects, skills, tools, and methodologies (whether Technical, Legal, Management, Design, or Scientific).

Text:
\"\"\"
{text[:4000]}
\"\"\"

Reference Known Skills: {json.dumps(taxonomy_names[:30])}

Return a strict JSON list of extracted skill objects with keys:
- "matched_mention": the exact term or course title found in the text (e.g. "Constitutional Law", "React.js", "Criminal Procedure")
- "normalized_name": clean standard name
- "category": high-level subject category (e.g. "Constitutional & Public Law", "Criminal Jurisprudence", "Legal Practice & Advocacy", "Frontend Frameworks", "Core CS", etc.)
- "confidence": number between 0.85 and 1.0

Return ONLY the raw JSON list, no markdown fences or conversational text.
"""
        try:
            response = self.gemini_model.generate_content(prompt)
            raw_text = response.text.strip()
            # Clean possible markdown formatting
            if raw_text.startswith("```json"):
                raw_text = raw_text[7:]
            if raw_text.startswith("```"):
                raw_text = raw_text[3:]
            if raw_text.endswith("```"):
                raw_text = raw_text[:-3]
            raw_text = raw_text.strip()
            
            extracted = json.loads(raw_text)
            results = []
            for item in extracted:
                norm_name = item.get("normalized_name", "").strip()
                if not norm_name:
                    continue
                    
                matched_id = None
                for tax in self.taxonomy:
                    if tax["name"].lower() == norm_name.lower() or any(alias.lower() == norm_name.lower() for alias in tax.get("aliases", [])):
                        matched_id = tax["id"]
                        break
                
                if matched_id:
                    tax_item = self.taxonomy_by_id[matched_id]
                    results.append({
                        "skill_id": tax_item["id"],
                        "skill_name": tax_item["name"],
                        "category": tax_item["category"],
                        "importance_weight": tax_item.get("importance_weight", 1.0),
                        "matched_mention": item.get("matched_mention", tax_item["name"]),
                        "confidence": float(item.get("confidence", 0.9)),
                        "extraction_source": "gemini_ai"
                    })
                else:
                    # Dynamically generate skill for open domains (e.g. LLB, Medicine, Business, Humanities)
                    safe_slug = re.sub(r'[^a-zA-Z0-9]+', '_', norm_name.lower()).strip('_')
                    gen_id = f"sk_dyn_{safe_slug[:24]}"
                    results.append({
                        "skill_id": gen_id,
                        "skill_name": norm_name,
                        "category": item.get("category", "General Professional Competencies"),
                        "importance_weight": 0.9,
                        "matched_mention": item.get("matched_mention", norm_name),
                        "confidence": float(item.get("confidence", 0.9)),
                        "extraction_source": "gemini_ai_dynamic"
                    })
            return results
        except Exception as e:
            logger.warning(f"Gemini API skill extraction error: {e}")
            return []

    def extract_from_text(self, text: str, use_llm: bool = True) -> List[Dict[str, Any]]:
        """
        Unified Hybrid Extraction:
        1. spaCy text cleaning
        2. Deterministic taxonomy regex
        3. Optional Gemini API enhancement
        4. Deduplicate and compute high-confidence scores
        """
        if not text:
            return []

        cleaned_text = self.clean_text_with_spacy(text)
        
        # Deterministic extraction
        regex_matches = self.extract_deterministic(cleaned_text)
        matched_ids = {m["skill_id"]: m for m in regex_matches}

        # LLM semantic extraction if enabled and key available
        if use_llm and self.gemini_model:
            gemini_matches = self.extract_with_gemini(cleaned_text)
            for gm in gemini_matches:
                s_id = gm["skill_id"]
                if s_id in matched_ids:
                    # Boost confidence when both regex and Gemini detect the skill
                    matched_ids[s_id]["confidence"] = min(1.0, matched_ids[s_id]["confidence"] + 0.05)
                    matched_ids[s_id]["extraction_source"] = "hybrid_verified"
                else:
                    matched_ids[s_id] = gm

        return list(matched_ids.values())

    def generate_domain_market_benchmark(self, curriculum_title: str, extracted_skills: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Dynamically analyzes ANY academic discipline (Law/LLB, Medicine, MBA, Arts, Engineering, etc.)
        against modern global and regional industry hiring standards.
        Returns domain-specific benchmark jobs, market alignment %, critical missing gaps, and actionable recommendations.
        """
        skill_names = [s["skill_name"] for s in extracted_skills]
        if not self.gemini_model or not skill_names:
            return {}

        prompt = f"""
You are a senior global academic accreditation and industry workforce intelligence analyst.
Analyze the curriculum: "{curriculum_title}"
Currently detected courses/competencies in this syllabus:
{json.dumps(skill_names[:30])}

Perform a rigorous real-world industry relevance assessment for this exact discipline (whether Law, Business, Medicine, Design, or Engineering).
Evaluate:
1. What real-world modern jobs/professions hire graduates from this curriculum?
2. What are the essential modern competencies required in the current workforce that this syllabus covers?
3. What are the CRITICAL INDUSTRY GAPS that modern employers demand today which are MISSING in traditional curricula of this degree (e.g. for Law: Legal Tech, Contract Automation, Data Privacy/GDPR, Cyber Law, FinTech Regulations, Cross-Border M&A)?
4. What actionable modules, clinics, or workshops must be integrated to increase employment readiness?

Return a strict JSON object with:
- "domain_name": primary professional discipline (e.g., "Legal Studies & Jurisprudence", "Computer Science", "Business Administration")
- "executive_summary": a 2-3 sentence forensic appraisal of current industry readiness
- "current_alignment_pct": estimated market alignment percentage (e.g. 52.5)
- "market_demand_skills": list of 8 to 12 top industry skills required in today's workforce for this discipline, each with:
    - "name": skill name
    - "category": subject category
    - "market_demand_pct": market frequency score (40 to 95)
    - "in_curriculum": boolean (true if reasonably covered in the input skills, false otherwise)
    - "importance_weight": number 0.8 to 1.0
    - "recommended_module": proposed course or workshop module to teach it
- "actionable_recommendations": list of 4 to 6 highest priority missing modules to add, each with:
    - "skill_name": competency name
    - "category": subject category
    - "priority": "HIGH" or "MEDIUM"
    - "recommended_action": clear practical curriculum recommendation
    - "impact_gain_pct": projected employability increase (e.g. 8.5)
- "simulated_market_roles": list of 4 to 6 active job titles in this sector (e.g., "Corporate Legal Counsel", "Regulatory Compliance Officer", "Litigation Associate")
- "portfolio_projects": list of 3 high-impact capstone/portfolio projects relevant specifically to this domain (e.g., for Law: "Moot Court Appellate Brief & Oral Arguments", "Digital Data Privacy & GDPR Compliance Audit Clinic", "AI-Powered Commercial Contract Review Pipeline"; for MBA: "Multi-Channel Go-To-Market Financial Model", etc.) each with:
    - "title": project title
    - "skills": list of 3-4 skills used
    - "description": 1-2 sentence real-world problem statement and deliverable
    - "difficulty": "Intermediate" or "Advanced"
    - "portfolioImpact": "High" or "Very High"
- "sample_job_postings": list of 4 to 6 real-world hiring profiles in this exact field, each with:
    - "title": job title (e.g., "Legal Associate - Regulatory Compliance", "Corporate M&A Legal Counsel")
    - "company": prominent real or representative firm/company in this sector (e.g., "Shardul Amarchand Mangaldas / Top Corporate Legal Dept", "Deloitte Risk & Regulatory")
    - "location": prominent hiring location (e.g., "Mumbai", "New Delhi", "Bengaluru", "Hybrid")
    - "experience": "0-2 Yrs" or "1-3 Yrs"
    - "description": realistic job brief detailing day-to-day responsibilities
    - "extracted_skills": list of 3-5 competency names required for this position

Return ONLY the raw JSON object. Do not include markdown ticks or conversational text.
"""
        try:
            response = self.gemini_model.generate_content(prompt)
            raw = response.text.strip()
            if raw.startswith("```json"):
                raw = raw[7:]
            if raw.startswith("```"):
                raw = raw[3:]
            if raw.endswith("```"):
                raw = raw[:-3]
            raw = raw.strip()
            return json.loads(raw)
        except Exception as e:
            logger.warning(f"Error generating dynamic market benchmark: {e}")
            return {}

    def parse_curriculum_courses(self, raw_text: str, curriculum_title: str) -> List[Dict[str, str]]:
        """
        Parses full syllabus text into individual accredited subjects/courses/modules.
        Uses Gemini to accurately decompose multi-year or multi-subject syllabi, with robust fallback.
        """
        if self.gemini_model and raw_text.strip():
            prompt = f"""
You are an academic registrar and curriculum data specialist.
Parse the following academic syllabus for "{curriculum_title}" into all of its individual distinct subjects / courses / modules.

Syllabus Text:
\"\"\"
{raw_text[:6000]}
\"\"\"

Extract every subject/module found.
Return a strict JSON list of objects with:
- "code": course code (e.g., "LAW-101", "CS-201", "MOD-01")
- "name": subject or course title (e.g. "Constitutional Law - I", "Criminal Law & Procedure", "Law of Contracts", "Data Structures")
- "description": 1 to 2 sentence summary of topics or units covered in this subject

Return ONLY the raw JSON list of course objects. Do not include markdown codeblocks or conversational text.
"""
            try:
                response = self.gemini_model.generate_content(prompt)
                raw = response.text.strip()
                if raw.startswith("```json"):
                    raw = raw[7:]
                if raw.startswith("```"):
                    raw = raw[3:]
                if raw.endswith("```"):
                    raw = raw[:-3]
                courses = json.loads(raw.strip())
                if isinstance(courses, list) and len(courses) > 0:
                    return courses
            except Exception as e:
                logger.warning(f"Gemini course decomposition failed, using regex fallback: {e}")

        # Fallback: Regex decomposition by headings, bullet points, or newlines
        parsed_courses = []
        lines = [line.strip() for line in raw_text.split("\n") if line.strip()]
        current_title = ""
        current_desc = []
        
        # Regex patterns for course/module headers
        header_pattern = re.compile(
            r'^(?:(?:Year|Semester|Term|Module|Unit|Paper|Course)\s*\d+|[•\-\*■\u2022\ufffd]\s*|[0-9]+[\.\)]\s+)',
            re.IGNORECASE
        )

        for line in lines:
            # Check if line looks like a course title (starts with bullet, number, or module header)
            is_header = bool(header_pattern.match(line)) or (":" in line and len(line.split(":")[0]) < 45)
            
            if is_header and len(line) < 100:
                if current_title:
                    parsed_courses.append({
                        "code": f"MOD-{len(parsed_courses)+1:02d}",
                        "name": current_title.strip("•-*■ \ufffd:"),
                        "description": " ".join(current_desc) if current_desc else current_title
                    })
                    current_desc = []
                
                parts = line.split(":", 1)
                if len(parts) == 2 and len(parts[0]) < 45:
                    current_title = parts[0].strip()
                    if parts[1].strip():
                        current_desc.append(parts[1].strip())
                else:
                    current_title = line
            else:
                if current_title:
                    current_desc.append(line)

        if current_title:
            parsed_courses.append({
                "code": f"MOD-{len(parsed_courses)+1:02d}",
                "name": current_title.strip("•-*■ \ufffd:"),
                "description": " ".join(current_desc) if current_desc else current_title
            })

        if not parsed_courses:
            # Chunking fallback
            paragraphs = [p.strip() for p in raw_text.split("\n\n") if len(p.strip()) > 30]
            for idx, p in enumerate(paragraphs[:10]):
                parsed_courses.append({
                    "code": f"MOD-{idx+1:02d}",
                    "name": p.split(".")[0][:50] if "." in p else f"Course Module {idx+1}",
                    "description": p[:400]
                })

        return parsed_courses


def normalize_skill_name(raw_name: str, taxonomy: List[Dict[str, Any]]) -> str:
    cleaned = raw_name.strip().lower()
    for item in taxonomy:
        for alias in item.get("aliases", []):
            if cleaned == alias.lower():
                return item["name"]
    return raw_name
