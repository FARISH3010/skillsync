# ⚡ SkillSync: Universal Curriculum-Intelligence & Skill Alignment Platform

**SkillSync** is a high-tech academic-to-industry intelligence platform. It continuously benchmarks higher-education curricula (Law, MBA, Medicine, Engineering, Arts, Sciences) against real-world employer skill demands, detects critical workforce gaps, simulates elective upgrades in real time, and produces actionable curriculum interventions.

---

## 📋 Table of Contents
1. [Prerequisites](#-prerequisites)
2. [API Keys Setup (Before Running)](#-api-keys-setup-before-running)
   - [A. Google Gemini API Key (Required for Multi-Discipline AI)](#a-google-gemini-api-key-required-for-universal-analysis)
   - [B. RapidAPI JSearch Key (Optional for Live LinkedIn Job Postings)](#b-rapidapi-jsearch-key-optional-for-live-linkedin-job-market)
3. [How to Run the Project](#-how-to-run-the-project)
   - [Running Backend (FastAPI)](#step-1-backend-fastapi)
   - [Running Frontend (React + Vite)](#step-2-frontend-react--vite)
4. [Platform Key Features](#-platform-key-features)
5. [Troubleshooting & Common Questions](#-troubleshooting--faq)

---

## 🔧 Prerequisites

Ensure you have the following installed on your system:
- **Python**: Version `3.10` or higher ([Download Python](https://www.python.org/downloads/))
- **Node.js**: Version `18.x` or higher and `npm` ([Download Node.js](https://nodejs.org/))
- **Git** (optional, for cloning)

---

## 🔑 API Keys Setup (Before Running)

Before launching the server, you must configure your API keys in the backend environment file.

### 1. Locate or Create the `.env` File
In your terminal, navigate to the `backend/` folder and inspect or create the `.env` file:
```powershell
cd D:\EP\backend
```
Make sure a file named `.env` exists inside `backend/` with the following structure:
```env
# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Database URL (Default SQLite)
DATABASE_URL=sqlite:///./skillsync.db

# Live LinkedIn / Job Aggregator API Key (RapidAPI JSearch)
RAPIDAPI_KEY=your_rapidapi_key_here
```

---

### A. Google Gemini API Key (Required for Universal Analysis)
The Gemini API powers live document parsing, universal degree competency identification (Law, Medicine, Business, Biotech, Engineering), and market gap analysis.

#### How to get a Free Google Gemini API Key:
1. Open your browser and go to **[Google AI Studio](https://aistudio.google.com/app/apikey)**.
2. Sign in with your Google account.
3. Click the blue button: **"Create API Key"** (or **"Get API key"**).
4. Select an existing Google Cloud project or click **"Create API key in new project"**.
5. Copy the generated key string (starts with `AIza...` or similar).
6. Paste it into `backend/.env`:
   ```env
   GEMINI_API_KEY=AIzaSy...
   ```

---

### B. RapidAPI JSearch Key (Optional for Live LinkedIn Job Market)
The platform includes a real-time connector that queries live job openings posted across **LinkedIn, Indeed, Glassdoor, and ZipRecruiter**.

#### How to get a Free RapidAPI JSearch Key:
1. Go to **[RapidAPI JSearch](https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch)**.
2. Sign up or log in for a free account (supports 1-click Google or GitHub sign-in).
3. Click **"Subscribe to Test"** and choose the **Basic (Free) Plan** ($0.00/month for ~200 free monthly searches).
4. Once subscribed, you will see your API key displayed in the code preview under:
   ```http
   X-RapidAPI-Key: your_key_here
   ```
5. Copy the key and paste it into `backend/.env`:
   ```env
   RAPIDAPI_KEY=your_rapidapi_key_here
   ```
*(Note: If you leave `RAPIDAPI_KEY` blank, SkillSync will smoothly fall back to high-fidelity AI-generated industry benchmark profiles for your discipline.)*

---

## 🚀 How to Run the Project

You need **two terminal windows**: one for the backend server and one for the frontend UI.

### Step 1: Backend (FastAPI)

1. Open **Terminal 1** (PowerShell or Command Prompt):
   ```powershell
   cd D:\EP\backend
   ```
2. Activate your Python virtual environment:
   ```powershell
   # If using existing venv in root:
   ..\venv\Scripts\Activate.ps1
   
   # Or in Command Prompt (cmd.exe):
   ..\venv\Scripts\activate.bat
   ```
3. If packages need to be installed, run:
   ```powershell
   pip install -r requirements.txt
   ```
4. Start the FastAPI server using Uvicorn:
   ```powershell
   uvicorn main:app --reload --port 8000
   ```
5. **Verify Backend**:
   - Live API status: **[http://localhost:8000](http://localhost:8000)**
   - Interactive Swagger API Documentation: **[http://localhost:8000/docs](http://localhost:8000/docs)**

---

### Step 2: Frontend (React + Vite)

1. Open **Terminal 2**:
   ```powershell
   cd D:\EP\frontend
   ```
2. Install frontend dependencies (only required the first time):
   ```powershell
   npm install
   ```
3. Start the Vite development server:
   ```powershell
   npm run dev
   ```
4. **Open in Browser**:
   - Access the platform at: **[http://localhost:5173](http://localhost:5173)**

---

## 🌟 Platform Key Features

- 📄 **Universal Course Ingestion (PDF / DOCX)**: Upload syllabi from any discipline (e.g., Bachelor of Laws / LL.B, MBA, Biotechnology, Computer Science).
- 🧠 **Dynamic Decomposition**: Parses complex syllabi into accredited course units, subject titles, and learning outcomes in the Course Catalog.
- 🎯 **Mathematical Alignment Engine**: Evaluates curriculum coverage against modern employer demand using deterministic weighted formulas:
  $$\text{Alignment \%} = \frac{\sum (\text{Covered} \times \text{Weight} \times \text{Demand})}{\sum (\text{Weight} \times \text{Demand})} \times 100$$
- ⚡ **Interactive What-If Curriculum Simulator**: Toggle elective competencies and observe live percentage gains on student market readiness.
- 🎓 **Student Pathway**: Generates discipline-specific portfolio capstones and an actionable missing skills checklist.
- 💼 **Industry Insights & Live Job Feed**: Displays active hiring profiles, required competencies, and salary/location trends powered by LinkedIn / JSearch.
- 🌓 **Adaptive Light & Dark Mode**: Toggle between high-tech slate glassmorphism and clean daylight themes with saved preferences in `localStorage`.

---

## ❓ Troubleshooting & FAQ

#### 1. "Failed to extract readable text from document"
- Ensure your PDF contains searchable computer text rather than scanned handwritten image pages. If uploading a scanned image, convert it to a searchable PDF with OCR first.

#### 2. "Quota exceeded (HTTP 429) on Gemini API"
- The project is configured with `gemini-3.5-flash-lite` and automatic fallbacks to avoid free-tier rate limits. If you hit a quota, verify your key at [Google AI Studio](https://aistudio.google.com/).

#### 3. Why are my results loading instantly after the first upload?
- The backend features **SQLite Database Benchmark Persistence** (`CurriculumBenchmark` table). Once an uploaded syllabus has been analyzed, its results are cached permanently in `skillsync.db` for instant load times (<30ms) upon page refresh.
