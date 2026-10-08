import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Layers, 
  BookOpen, 
  Briefcase, 
  Cpu, 
  Sliders, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  RefreshCw,
  PlusCircle,
  XCircle,
  FileText,
  Building,
  GraduationCap,
  UploadCloud,
  Download,
  Users,
  Sparkles,
  Zap,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  ArrowUpRight,
  Sun,
  Moon,
  Plus,
  ExternalLink
} from 'lucide-react';

import FileUploadModal from './components/FileUploadModal';
import ResumeUploadModal from './components/ResumeUploadModal';
import SimulatorView from './components/SimulatorView';
import StudentView from './components/StudentView';
import IndustryView from './components/IndustryView';
import CircularCoverageGauge from './components/CircularCoverageGauge';
import { exportReportToCSV, exportReportToPDF } from './utils/reportExporter';
import { getResourcesForCourse } from './utils/courseResources';

const API_BASE = "http://localhost:8000";

export default function App() {
  // Navigation & Role Views (Academic Planner, Student, Industry Partner)
  const [activeRole, setActiveRole] = useState('faculty'); // 'faculty' | 'student' | 'industry'
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'simulator' | 'curriculum'

  // Curricula management
  const [curriculaList, setCurriculaList] = useState([]);
  const [selectedCurriculumId, setSelectedCurriculumId] = useState(() => {
    return localStorage.getItem('skillsync-active-curriculum') || 'curr_cs_2024';
  });

  // Core Data States
  const [dashboardData, setDashboardData] = useState(null);
  const [curriculumData, setCurriculumData] = useState(null);
  const [jobsData, setJobsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [backendHealth, setBackendHealth] = useState(null);
  const [error, setError] = useState(null);

  // Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);

  // UX Improvement: Curricular Skill Gap & Labor Matrix Dropdown Collapsible state
  const [isMatrixDropdownOpen, setIsMatrixDropdownOpen] = useState(true);

  // Student checklist completed skills state (reflects directly into matrix & coverage)
  const [completedSkills, setCompletedSkills] = useState([]);

  // What-If Simulator State
  const [simulatedSkills, setSimulatedSkills] = useState([]);
  const [simulationResult, setSimulationResult] = useState(null);
  const [simulating, setSimulating] = useState(false);

  // Category filter state for priority heatmap
  const [heatmapCategoryFilter, setHeatmapCategoryFilter] = useState('ALL');

  // Light / Dark Theme Mode with localStorage persistence
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('skillsync-theme') || 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
    }
    localStorage.setItem('skillsync-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Fetch all initial data
  const fetchData = async (currId = selectedCurriculumId) => {
    setLoading(true);
    setError(null);
    try {
      // Check health
      const healthRes = await fetch(`${API_BASE}/health`).catch(() => null);
      if (healthRes && healthRes.ok) {
        setBackendHealth(await healthRes.json());
      }

      // Fetch curricula list
      const listRes = await fetch(`${API_BASE}/curricula`);
      if (listRes.ok) {
        const listData = await listRes.json();
        setCurriculaList(listData);
      }

      // Fetch gaps, curriculum, and jobs
      const [gapsRes, currRes, jobsRes] = await Promise.all([
        fetch(`${API_BASE}/dashboard/gaps?curriculum_id=${currId}`),
        fetch(`${API_BASE}/curriculum/${currId}/skills`),
        fetch(`${API_BASE}/jobs?curriculum_id=${currId}`)
      ]);

      if (!gapsRes.ok || !currRes.ok || !jobsRes.ok) {
        throw new Error("Unable to connect to SkillSync backend API");
      }

      const gaps = await gapsRes.json();
      const curr = await currRes.json();
      const jobs = await jobsRes.json();

      setDashboardData(gaps);
      setCurriculumData(curr);
      setJobsData(jobs);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(selectedCurriculumId);
  }, [selectedCurriculumId]);

  // Handle switching curriculum
  const handleSelectCurriculum = (cId) => {
    setSelectedCurriculumId(cId);
    localStorage.setItem('skillsync-active-curriculum', cId);
    setSimulatedSkills([]);
    setSimulationResult(null);
  };

  // Toggle simulated skills in What-If Simulator
  const handleToggleSimulatedSkill = async (skillId) => {
    let nextSimulated = [...simulatedSkills];
    if (nextSimulated.includes(skillId)) {
      nextSimulated = nextSimulated.filter(id => id !== skillId);
    } else {
      nextSimulated.push(skillId);
    }
    setSimulatedSkills(nextSimulated);

    setSimulating(true);
    try {
      const res = await fetch(`${API_BASE}/simulator/what-if`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          curriculum_id: selectedCurriculumId,
          simulated_skill_ids: nextSimulated
        })
      });
      const data = await res.json();
      setSimulationResult(data);
    } catch (err) {
      console.error("Simulation error", err);
    } finally {
      setSimulating(false);
    }
  };

  const handleResetSimulator = () => {
    setSimulatedSkills([]);
    setSimulationResult(null);
  };

  // Triggered when a new PDF/DOCX is parsed & uploaded
  const handleUploadSuccess = (uploadData) => {
    if (uploadData && uploadData.curriculum_id) {
      setSelectedCurriculumId(uploadData.curriculum_id);
      localStorage.setItem('skillsync-active-curriculum', uploadData.curriculum_id);
      fetchData(uploadData.curriculum_id);
    }
  };

  // Student toggle completed skill handler
  const handleToggleCompleteSkill = (skillId) => {
    setCompletedSkills(prev => {
      if (prev.includes(skillId)) {
        return prev.filter(id => id !== skillId);
      } else {
        return [...prev, skillId];
      }
    });
  };

  if (loading && !dashboardData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#FFF0F3] text-stone-900 font-['Hanken_Grotesk'] p-6 relative overflow-hidden">
        {/* Soft background glow accents */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-rose-200/50 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-orange-200/40 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center max-w-sm text-center">
          {/* Logo badge with pulsing ring */}
          <div className="relative mb-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-500 via-rose-600 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/25 ring-4 ring-white animate-pulse">
              <Layers className="w-8 h-8 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white shadow-xs flex items-center justify-center border border-rose-100">
              <RefreshCw className="w-3.5 h-3.5 text-rose-600 animate-spin" />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100/80 border border-rose-200 text-rose-700 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3 h-3 text-orange-500" />
            <span>Curriculum Intelligence</span>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-stone-950 font-['Hanken_Grotesk']">
            Skill<span className="text-rose-600">Sync</span> Engine
          </h2>
          
          <p className="text-xs text-stone-600 mt-2 font-normal leading-relaxed">
            Synchronizing labor demand telemetry, spaCy taxonomy, and syllabus benchmarks...
          </p>

          <div className="w-48 h-1.5 bg-rose-200/80 rounded-full mt-6 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-rose-500 via-orange-500 to-rose-600 rounded-full w-2/3 animate-[pulse_1.5s_ease-in-out_infinite]" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#FFF0F3] text-stone-900 font-['Hanken_Grotesk'] p-6 relative overflow-hidden">
        {/* Soft background glow accents */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-rose-200/50 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-orange-200/40 blur-3xl pointer-events-none" />

        <div className="relative z-10 bg-white border border-rose-200 rounded-3xl p-8 max-w-md w-full text-center shadow-rose-glow flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-100 border border-rose-200 flex items-center justify-center mb-4 text-rose-600 shadow-xs">
            <AlertTriangle className="w-7 h-7" />
          </div>

          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 uppercase tracking-wider mb-2">
            Connection Advisory
          </span>

          <h2 className="text-xl font-bold tracking-tight text-stone-950 font-['Hanken_Grotesk']">
            Backend Service Offline
          </h2>

          <p className="text-xs text-stone-600 mt-2 leading-relaxed">
            {error}. Ensure the FastAPI server is running on <code className="px-1.5 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-700 font-mono text-[11px]">http://localhost:8000</code>.
          </p>

          <button 
            onClick={() => fetchData(selectedCurriculumId)} 
            className="mt-6 w-full py-2.5 px-4 bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-orange-500/25 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>
        </div>
      </div>
    );
  }

  const rawDisplayData = simulationResult || dashboardData;
  const rawSkillsList = rawDisplayData?.skills || [];

  // Integrate student checklist done skills: mark as covered and recompute coverage
  const skillsWithChecklist = rawSkillsList.map(skill => {
    const isCheckedDone = completedSkills.includes(skill.skill_id);
    const isSim = simulatedSkills.includes(skill.skill_id);
    const isCovered = skill.is_covered || isCheckedDone || isSim;
    return {
      ...skill,
      is_covered: isCovered,
      is_student_completed: isCheckedDone,
      status: isCovered ? "COVERED" : skill.status,
      gap_score: isCovered ? 0.0 : skill.gap_score
    };
  });

  // Calculate dynamic coverage with checklist & simulation additions
  const totalMarketSkills = skillsWithChecklist.length;
  const coveredCount = skillsWithChecklist.filter(s => s.is_covered).length;
  const baselinePct = Number(dashboardData?.summary?.baseline_coverage_pct ?? dashboardData?.summary?.overall_coverage_pct ?? 54.2);
  const calculatedCoveragePct = totalMarketSkills > 0 
    ? Number(((coveredCount / totalMarketSkills) * 100).toFixed(1))
    : Number(rawDisplayData?.summary?.overall_coverage_pct ?? 54.2);
  const currentCoveragePct = calculatedCoveragePct;
  const simulatedGainPct = Number((currentCoveragePct - baselinePct).toFixed(1));

  const currentDisplayData = {
    ...(rawDisplayData || {}),
    summary: {
      ...(rawDisplayData?.summary || {}),
      overall_coverage_pct: currentCoveragePct,
      baseline_coverage_pct: baselinePct,
      simulated_gain_pct: Math.max(0, simulatedGainPct),
      critical_gaps_count: skillsWithChecklist.filter(s => s.status === 'CRITICAL_GAP' && !s.is_covered).length,
      total_industry_jobs_analyzed: rawDisplayData?.summary?.total_industry_jobs_analyzed || 10,
      total_skills_tracked: totalMarketSkills || rawDisplayData?.summary?.total_skills_tracked || 30
    },
    skills: skillsWithChecklist
  };

  // Category filters for the recommendation / priority heatmap
  const rawSkills = skillsWithChecklist;
  const heatmapCategories = ['ALL', ...Array.from(new Set(rawSkills.map(s => s.category)))];
  const filteredSkills = rawSkills.filter(s => {
    if (heatmapCategoryFilter === 'ALL') return true;
    return s.category === heatmapCategoryFilter;
  });

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#151012] text-[#FDF2F4]' : 'bg-[#FFF0F3] text-stone-800'} flex flex-col font-['Hanken_Grotesk'] transition-colors duration-200 selection:bg-rose-200 selection:text-rose-950`}>
      
      {/* 1. TOP HEADER NAVBAR (STITCH GLASSPINK HEADER) */}
      <header className={`sticky top-0 z-40 ${theme === 'dark' ? 'bg-[#1F171A]/95 border-[#4B3843]' : 'bg-white/90 border-rose-200/70'} backdrop-blur-md border-b px-4 sm:px-8 py-3 flex items-center justify-between shadow-[0_2px_12px_rgba(244,63,94,0.05)]`}>
        
        {/* Brand Logo & Wordmark */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 via-rose-600 to-orange-500 flex items-center justify-center text-white shadow-md shadow-rose-500/25 ring-2 ring-white">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-xl font-bold tracking-tight text-stone-950">
                  Skill<span className="text-rose-600">Sync</span>
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 tracking-wider uppercase border border-rose-200/80">
                  PRO
                </span>
              </div>
              <span className="text-[10px] text-stone-400 font-medium tracking-tight block mt-0.5">
                Curriculum Intelligence Engine
              </span>
            </div>
          </div>

          {/* Active Cohort Switcher / Dropdown */}
          <div className="hidden md:flex items-center gap-2 pl-4 border-l border-rose-200/80">
            {curriculaList.length > 1 ? (
              <select
                value={selectedCurriculumId}
                onChange={(e) => handleSelectCurriculum(e.target.value)}
                className="bg-[#FFF5F7] border border-rose-200 text-stone-800 text-xs rounded-full px-3 py-1.5 focus:outline-none focus:border-rose-400 font-semibold cursor-pointer shadow-xs"
              >
                {curriculaList.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFF5F7] border border-rose-200 text-stone-700 text-xs font-medium shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200 animate-pulse"></span>
                <span className="font-bold text-stone-900">CS Curriculum v2024.1</span>
                <span className="text-rose-700/80 font-medium bg-rose-100/70 px-2 py-0.5 rounded-full text-[10px]">Fall Cohort</span>
              </div>
            )}
          </div>
        </div>

        {/* Live Status Indicator */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF5F7] border border-rose-200 text-stone-700 text-xs shadow-xs">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-medium">
            <strong className="text-stone-900 font-mono">{jobsData.length || 10} Job Postings</strong> Synced
          </span>
        </div>

        {/* Header Right Action Group */}
        <div className="flex items-center gap-2.5">
          {/* Light / Dark Mode Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-full border transition-colors cursor-pointer flex items-center justify-center ${
              theme === 'dark'
                ? 'bg-[#261D22] border-[#4B3843] text-[#D4B8C3] hover:text-white'
                : 'bg-white border-rose-200 text-stone-600 hover:text-stone-900 hover:bg-rose-50'
            }`}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-rose-500" />
            )}
          </button>

          {/* Sync Market / Refresh */}
          <button
            onClick={() => fetchData(selectedCurriculumId)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-rose-200 text-stone-700 hover:bg-rose-50 text-xs font-semibold transition-all shadow-xs cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className="w-3.5 h-3.5 text-rose-600" />
            <span>Sync Market</span>
          </button>

          {/* Secondary CTA: Diagnostic Resume Check */}
          <button
            onClick={() => setIsResumeModalOpen(true)}
            className="btn-secondary cursor-pointer text-xs flex items-center gap-1.5 border-rose-200 text-stone-700 hover:bg-rose-50"
            title="Upload and evaluate candidate resume"
          >
            <FileText className="w-3.5 h-3.5 text-rose-600" />
            <span className="hidden sm:inline">Diagnostic</span> Resume
          </button>

          {/* Primary CTA: Upload Syllabus */}
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="btn-primary cursor-pointer text-xs"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Syllabus</span>
          </button>
        </div>
      </header>

      {/* 2. SEGMENTED ROLE NAVIGATION BAR */}
      <div className="max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-8 pt-5 pb-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rose-200/80 pb-4">
          
          {/* Role Navigation Pills */}
          <div className="inline-flex bg-[#FFF5F7] p-1 rounded-full border border-rose-200/80 text-xs font-semibold shadow-xs">
            <button
              onClick={() => { setActiveRole('faculty'); setActiveTab('dashboard'); }}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeRole === 'faculty'
                  ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Academic Planner</span>
            </button>

            <button
              onClick={() => { setActiveRole('student'); setActiveTab('student'); }}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeRole === 'student'
                  ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Student Pathway</span>
            </button>

            <button
              onClick={() => { setActiveRole('industry'); setActiveTab('jobs'); }}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeRole === 'industry'
                  ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Industry Insights</span>
            </button>
          </div>

          {/* Academic Planner Subtab Navigation */}
          {activeRole === 'faculty' && (
            <div className="flex items-center gap-1.5 bg-[#FFF5F7] p-1 rounded-full border border-rose-200/80">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-white text-rose-700 shadow-xs border border-rose-200'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Executive Gap Matrix
              </button>
              <button
                onClick={() => setActiveTab('simulator')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === 'simulator'
                    ? 'bg-white text-rose-700 shadow-xs border border-rose-200'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-orange-500" />
                <span>What-If Simulator</span>
                {simulatedSkills.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 inline-block animate-pulse" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('curriculum')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === 'curriculum'
                    ? 'bg-white text-rose-700 shadow-xs border border-rose-200'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Course Catalog
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. MAIN DASHBOARD VIEWPORT */}
      <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-5 space-y-6">
        
        {/* VIEW 1: ACADEMIC PLANNER */}
        {activeRole === 'faculty' && (
          <>
            {/* SUBTAB: EXECUTIVE GAP MATRIX */}
            {activeTab === 'dashboard' && currentDisplayData && (
              <div className="space-y-6">
                
                {/* Top Breadcrumb Ribbon */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs font-mono tracking-wide">
                    <span className="px-2.5 py-0.5 rounded-md bg-rose-100 text-rose-800 font-semibold">FACULTY SENATE</span>
                    <span className="text-rose-300">/</span>
                    <span className="text-stone-600">Curriculum Intelligence Dossier</span>
                    <span className="text-rose-300">/</span>
                    <span className="text-rose-600 font-bold">{dashboardData?.curriculum?.title || 'Academic Plan'}</span>
                  </div>
                  {simulatedSkills.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 shadow-pink-card">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{simulatedSkills.length} Draft Injections Active</span>
                      </span>
                      <button
                        onClick={handleResetSimulator}
                        className="text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer underline px-1"
                      >
                        Reset Draft
                      </button>
                    </div>
                  )}
                </div>

                {/* EDITORIAL COMMAND CENTER BENTO CARD */}
                <div className="bg-gradient-to-r from-white via-[#FFF7F9] to-white border border-rose-200 rounded-2xl p-5 lg:p-6 shadow-rose-glow relative overflow-hidden">
                  <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-gradient-to-bl from-rose-200/40 via-orange-100/30 to-transparent blur-3xl pointer-events-none"></div>
                  <div className="absolute left-1/3 -bottom-20 w-60 h-60 rounded-full bg-rose-300/20 blur-3xl pointer-events-none"></div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
                    
                    {/* Left: Editorial Title & Context */}
                    <div className="lg:col-span-4 flex flex-col justify-center">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 uppercase tracking-widest mb-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-500"></span> Executive Telemetry Dossier
                      </span>
                      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-medium tracking-tight text-stone-950 leading-tight">
                        Curriculum Intelligence &amp; Labor Alignment
                      </h1>
                      <p className="text-xs sm:text-sm text-stone-600 mt-2 font-normal leading-relaxed">
                        {currentDisplayData.summary?.executive_summary || 'Algorithmic benchmark evaluating syllabus alignment against real-time workforce demands.'}
                      </p>
                      <div className="flex items-center gap-3 mt-4 pt-3 border-t border-rose-100">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-700">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Institution: {dashboardData?.curriculum?.institution || 'Academic Council'}</span>
                        </div>
                        <span className="text-stone-300">•</span>
                        <div className="text-xs text-stone-500 font-mono">Sync: Live</div>
                      </div>
                    </div>

                    {/* Center: Radial Telemetry Visual */}
                    <div className="lg:col-span-3 flex items-center justify-center lg:border-x lg:border-rose-200/80 px-2 py-1">
                      <div className="flex items-center gap-4">
                        <CircularCoverageGauge 
                          baselinePct={baselinePct} 
                          currentPct={currentCoveragePct} 
                          size={120} 
                        />
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-1.5 text-xs">
                            <span className="w-2.5 h-2.5 rounded-sm bg-gradient-to-r from-rose-600 to-orange-500"></span>
                            <span className="font-bold text-stone-800">Current Fit</span>
                            {Number(simulatedGainPct) > 0 && (
                              <span className="text-xs font-semibold text-emerald-700 flex items-center bg-emerald-50 px-1 py-0.5 rounded border border-emerald-200 text-[10px]">
                                +{simulatedGainPct}% Lift
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-stone-500">
                            <span className="w-2.5 h-2.5 rounded-sm bg-stone-300"></span>
                            <span>Target Goal: <strong className="text-stone-800 font-semibold">70.0%</strong></span>
                          </div>
                          <div className="text-[11px] text-stone-500 font-normal leading-tight pt-1">
                            {currentCoveragePct >= 70 ? (
                              <span className="font-bold text-emerald-600">Goal achieved</span>
                            ) : (
                              <span>Gap: <span className="font-bold text-rose-600">{(70.0 - currentCoveragePct).toFixed(1)}%</span> to target</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: 3 Key High-Impact Bento Stat Clusters */}
                    <div className="lg:col-span-5 grid grid-cols-3 gap-3">
                      {/* Stat 1: Critical Gaps */}
                      <div className="bg-gradient-to-br from-white to-[#FFF0F3] border border-rose-200/90 rounded-xl p-3.5 flex flex-col justify-between shadow-xs hover:border-rose-300 transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold uppercase tracking-wide text-rose-800">Critical Gaps</span>
                          <span className="w-6 h-6 rounded-lg bg-rose-100 flex items-center justify-center text-rose-600">
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </span>
                        </div>
                        <div className="my-2">
                          <div className="text-2xl sm:text-3xl font-black text-rose-600 tabular-nums">
                            {currentDisplayData.summary.critical_gaps_count}
                          </div>
                          <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100/90 text-rose-700 border border-rose-200">
                            High Priority
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 leading-tight">High-frequency hiring posts (≥60%)</p>
                      </div>

                      {/* Stat 2: Analyzed Job Roles */}
                      <div className="bg-gradient-to-br from-white to-[#FFF0F3] border border-rose-200/90 rounded-xl p-3.5 flex flex-col justify-between shadow-xs hover:border-rose-300 transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold uppercase tracking-wide text-stone-600">Market Roles</span>
                          <span className="w-6 h-6 rounded-lg bg-stone-100 flex items-center justify-center text-stone-700">
                            <Briefcase className="w-3.5 h-3.5" />
                          </span>
                        </div>
                        <div className="my-2">
                          <div className="text-2xl sm:text-3xl font-black text-stone-900 tabular-nums">
                            {currentDisplayData.summary.total_industry_jobs_analyzed}
                          </div>
                          <span className="text-[10px] text-stone-500 font-medium">Cloud &amp; AI Profiles</span>
                        </div>
                        <p className="text-[11px] text-stone-500 leading-tight font-mono tabular-nums">
                          {currentDisplayData.summary.total_skills_tracked} skills tracked
                        </p>
                      </div>

                      {/* Stat 3: Potential Fit Gain */}
                      <div className="bg-gradient-to-br from-white to-[#F0FDF4] border border-emerald-200/90 rounded-xl p-3.5 flex flex-col justify-between shadow-xs hover:border-emerald-300 transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold uppercase tracking-wide text-emerald-800">Simulated Gain</span>
                          <span className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                            <TrendingUp className="w-3.5 h-3.5" />
                          </span>
                        </div>
                        <div className="my-2">
                          <div className="text-2xl sm:text-3xl font-black text-emerald-600 tabular-nums">
                            +{simulatedGainPct}%
                          </div>
                          <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100/90 text-emerald-800 border border-emerald-200">
                            Projected {(currentCoveragePct + Number(simulatedGainPct)).toFixed(1)}%
                          </span>
                        </div>
                        <button 
                          onClick={() => setActiveTab('simulator')}
                          className="text-[11px] text-emerald-700 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          Open Simulator <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                  </div>
                </div>

                {/* ASYMMETRIC BENTO GRID: 8 COLS TABLE + 4 COLS RECOMMENDATIONS */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* LEFT COMPONENT: CURRICULAR SKILL GAP & LABOR MATRIX (8 COLS) */}
                  <div className="lg:col-span-8 flex flex-col gap-4">
                    <div className="bg-white border border-rose-200 rounded-2xl p-5 shadow-pink-card flex flex-col gap-4">
                      
                      {/* Header Ribbon / Collapsible Trigger */}
                      <div 
                        onClick={() => setIsMatrixDropdownOpen(!isMatrixDropdownOpen)}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-rose-100 cursor-pointer select-none group"
                      >
                        <div>
                          <div className="flex items-center gap-2.5">
                            <div className="w-3 h-3 rounded-full bg-rose-500 ring-4 ring-rose-100"></div>
                            <h2 className="text-lg font-bold text-stone-900 group-hover:text-rose-700 transition-colors tracking-tight font-['Hanken_Grotesk'] flex items-center gap-2">
                              Curricular Skill Gaps &amp; Labor Alignment Matrix
                            </h2>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FFE8ED] border border-rose-300 text-rose-800 tabular-nums">
                              {filteredSkills.length} Total Verified
                            </span>
                          </div>
                          <p className="text-xs text-stone-500 mt-1 pl-5.5">
                            {isMatrixDropdownOpen 
                              ? 'Real-time telemetry benchmarking syllabus coverage against live market demands. Click to minimize.' 
                              : 'Collapsed to streamline view. Click to expand full matrix.'}
                          </p>
                        </div>

                        {/* Export Utility & Toggle */}
                        <div className="flex items-center gap-2 self-start sm:self-auto" onClick={(e) => e.stopPropagation()}>
                          <button 
                            onClick={() => exportReportToCSV(currentDisplayData)}
                            className="p-1.5 rounded-xl bg-[#FFF5F7] border border-rose-200 text-stone-600 hover:text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer" 
                            title="Export CSV"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setIsMatrixDropdownOpen(!isMatrixDropdownOpen)}
                            className="p-1.5 rounded-xl bg-[#FFF5F7] border border-rose-200 text-stone-600 hover:text-rose-700 transition-colors cursor-pointer"
                          >
                            {isMatrixDropdownOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Collapsible Content */}
                      {isMatrixDropdownOpen && (
                        <>
                          {/* Segment Filter Pills */}
                          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
                            {heatmapCategories.map(cat => (
                              <button
                                key={cat}
                                onClick={() => setHeatmapCategoryFilter(cat)}
                                className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                                  heatmapCategoryFilter === cat
                                    ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-xs font-bold'
                                    : 'bg-[#FFF0F3] hover:bg-rose-100 text-stone-700 border border-rose-200'
                                }`}
                              >
                                <span>{cat}</span>
                              </button>
                            ))}
                          </div>

                          {/* Elevated Clinical Table */}
                          <div className="overflow-x-auto -mx-5 px-5">
                            <table className="w-full text-left border-collapse min-w-[700px]">
                              <thead>
                            <tr className="border-y border-rose-100 text-[11px] font-bold text-rose-900/70 uppercase tracking-wider bg-[#FFF5F7]">
                              <th className="py-3 px-3">Competency / Skill</th>
                              <th className="py-3 px-3">Category</th>
                              <th className="py-3 px-3">Market Demand</th>
                              <th className="py-3 px-3">Status</th>
                              <th className="py-3 px-3 text-right">Action Trigger</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-rose-100/70 text-xs">
                            {filteredSkills.map((skill) => {
                              const isSimulated = simulatedSkills.includes(skill.skill_id);

                              return (
                                <tr key={skill.skill_id} className="hover:bg-[#FFF5F7]/80 transition-colors group">
                                  <td className="py-3 px-3">
                                    <div className="font-bold text-stone-900 group-hover:text-rose-700 transition-colors">
                                      {skill.name}
                                    </div>
                                    <div className="text-[11px] text-stone-500 font-normal">
                                      {skill.recommended_module || 'Standard Curriculum Module'}
                                    </div>
                                  </td>
                                  <td className="py-3 px-3">
                                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 border border-rose-200 text-rose-800">
                                      {skill.category}
                                    </span>
                                  </td>
                                  <td className="py-3 px-3">
                                    <div className="flex items-center gap-2">
                                      <span className="tabular-nums font-bold text-stone-900 text-xs w-8">
                                        {skill.market_frequency_pct}%
                                      </span>
                                      <div className="w-20 bg-rose-100 h-2 rounded-full overflow-hidden">
                                        <div 
                                          className="bg-gradient-to-r from-rose-500 to-orange-500 h-full rounded-full transition-all duration-500" 
                                          style={{ width: `${skill.market_frequency_pct}%` }} 
                                        />
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-3 px-3">
                                    {skill.is_covered || isSimulated ? (
                                      <span className="badge-aligned">
                                        <CheckCircle2 className="w-3 h-3" />
                                        {isSimulated ? 'Simulated' : 'Covered'}
                                      </span>
                                    ) : (
                                      <span className="badge-critical">
                                        <XCircle className="w-3 h-3" /> Missing Gap
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-3 px-3 text-right">
                                    {!skill.is_covered && (
                                      <button
                                        onClick={() => handleToggleSimulatedSkill(skill.skill_id)}
                                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer flex items-center gap-1 ml-auto ${
                                          isSimulated
                                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300'
                                            : 'bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 text-white shadow-xs'
                                        }`}
                                      >
                                        {isSimulated ? '✓ In Draft' : '+ Add Module'}
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                        </>
                      )}

                    </div>

                    {/* Secondary Strategic Guidance Bar */}
                    <div className="bg-gradient-to-r from-rose-500/10 via-white to-orange-500/10 border border-rose-200/90 rounded-2xl p-4 flex items-start gap-3 shadow-pink-card">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-orange-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-rose-500/20">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wide">Autonomous Curriculum Harmonization</h4>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">Advisory</span>
                        </div>
                        <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                          Curriculum updates committed in this dashboard synchronize syllabus diffs with accreditation registries and generate faculty training hour estimates.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT COMPONENT: DOCKED / FLOATING ALGORITHMIC INTERVENTIONS & FACULTY ACTIONS (4 COLS) */}
                  <div className="lg:col-span-4 flex flex-col gap-4">
                    <div className="bg-white border-2 border-rose-200 rounded-2xl p-5 shadow-rose-glow flex flex-col gap-4 relative overflow-hidden">
                      
                      {/* Header Ribbon */}
                      <div className="border-b border-rose-100 pb-3 flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 ring-2 ring-rose-200"></span>
                            <h3 className="text-base font-bold text-stone-950 font-['Hanken_Grotesk']">
                              Algorithmic Interventions
                            </h3>
                          </div>
                          <p className="text-xs text-stone-500 mt-1">
                            Prioritized by faculty workload vs student placement lift.
                          </p>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-rose-500 to-orange-500 text-white uppercase tracking-wider shadow-xs">
                          Engine Rank
                        </span>
                      </div>

                      {/* Interventions Cards */}
                      <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-1">
                        {currentDisplayData.recommendations.map((rec) => (
                          <div 
                            key={rec.skill_id}
                            className="p-4 rounded-xl bg-gradient-to-b from-[#FFF5F7] to-white border border-rose-200/90 hover:border-rose-400 hover:shadow-md transition-all flex flex-col gap-3 group"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h4 className="text-xs font-bold text-stone-900 group-hover:text-rose-700 transition-colors">
                                  {rec.skill_name}
                                </h4>
                                <span className="text-[11px] text-rose-700 font-mono font-medium block mt-0.5">
                                  Category: {rec.category}
                                </span>
                              </div>
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-rose-100 text-rose-800 border border-rose-200 tabular-nums whitespace-nowrap shadow-xs">
                                +{rec.impact_gain_pct}% Lift
                              </span>
                            </div>

                            <p className="text-xs text-stone-600 leading-relaxed">
                              {rec.recommended_action}
                            </p>

                            {/* Verified Learning Resources Near Suggested Course */}
                            {(() => {
                              const resList = getResourcesForCourse(rec.recommended_action, rec.skill_name, [rec.skill_name]);
                              return resList && resList.length > 0 ? (
                                <div className="p-2.5 rounded-lg bg-white/90 border border-rose-200/80 space-y-1.5">
                                  <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wide flex items-center gap-1">
                                    <BookOpen className="w-3 h-3 text-rose-600" />
                                    Course Learning Resources &amp; Guides:
                                  </span>
                                  <div className="flex flex-col gap-1">
                                    {resList.map((res, rIdx) => (
                                      <a
                                        key={rIdx}
                                        href={res.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="text-[11px] text-rose-700 hover:text-rose-900 hover:underline flex items-center justify-between group/link bg-[#FFF5F7] px-2 py-1 rounded border border-rose-100 transition-colors"
                                      >
                                        <span className="truncate max-w-[210px] font-medium">{res.title}</span>
                                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-white text-stone-600 border border-rose-200 shrink-0 flex items-center gap-0.5">
                                          {res.provider} <ExternalLink className="w-2.5 h-2.5" />
                                        </span>
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              ) : null;
                            })()}

                            <div className="flex items-center justify-between pt-1">
                              <span className={rec.priority === 'HIGH' ? 'badge-critical text-[10px]' : 'badge-warning text-[10px]'}>
                                {rec.priority} PRIORITY
                              </span>
                              <button 
                                onClick={() => handleToggleSimulatedSkill(rec.skill_id)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer flex items-center gap-1.5 ${
                                  simulatedSkills.includes(rec.skill_id)
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300'
                                    : 'bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 text-white shadow-sm shadow-orange-500/25'
                                }`}
                              >
                                {simulatedSkills.includes(rec.skill_id) ? (
                                  <>
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>✓ In Draft</span>
                                  </>
                                ) : (
                                  <>
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>+ Commit to Draft</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Export buttons */}
                      <div className="pt-3 border-t border-rose-100 flex items-center gap-2">
                        <button
                          onClick={() => exportReportToPDF(currentDisplayData)}
                          className="btn-primary flex-1 text-xs"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Export PDF Proposal</span>
                        </button>
                        <button
                          onClick={() => exportReportToCSV(currentDisplayData)}
                          className="btn-secondary text-xs"
                          title="Export CSV"
                        >
                          CSV
                        </button>
                      </div>

                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* SUBTAB: WHAT-IF SIMULATOR */}
            {activeTab === 'simulator' && (
              <SimulatorView
                dashboardData={dashboardData}
                simulatedSkills={simulatedSkills}
                onToggleSimulatedSkill={handleToggleSimulatedSkill}
                onResetSimulator={handleResetSimulator}
                simulationResult={simulationResult}
                simulating={simulating}
              />
            )}

            {/* SUBTAB: COURSE CATALOG */}
            {activeTab === 'curriculum' && curriculumData && (
              <div className="space-y-4">
                <div className="clean-card p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                    <div>
                      <h3 className="text-xl font-semibold">{curriculumData.title}</h3>
                      <p className="text-xs text-[#718096] mt-0.5">
                        Accredited course catalog mapped with verified skill competencies.
                      </p>
                    </div>
                    <span className="badge-info text-xs">
                      {curriculumData.courses.length} Accredited Courses
                    </span>
                  </div>

                    <div className="space-y-3">
                      {curriculumData.courses.map((course) => (
                        <div key={course.code} className="bg-white border border-rose-200/90 p-5 rounded-2xl shadow-pink-card hover:border-rose-300 transition-colors">
                          <div className="flex items-center gap-2.5 mb-2">
                            <span className="px-2.5 py-0.5 bg-[#FFF0F3] text-rose-700 rounded-full font-mono text-xs font-bold border border-rose-200">
                              {course.code}
                            </span>
                            <h4 className="text-sm font-bold text-stone-900">{course.name}</h4>
                          </div>
                          <p className="text-xs text-stone-600 mb-3 leading-relaxed">
                            {course.description}
                          </p>
                          
                          <div>
                            <span className="text-[11px] font-bold text-rose-800/80 block mb-1.5 uppercase tracking-wide">
                              Mapped Competencies:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {course.mapped_skills.map((s, idx) => (
                                <span 
                                  key={idx} 
                                  className="px-2.5 py-0.5 rounded-full text-xs bg-[#FFF5F7] border border-rose-200 text-stone-700 flex items-center gap-1.5 font-medium"
                                >
                                  {s.skill_name}
                                  <span className="text-rose-500 font-mono text-[10px]">({s.matched_mention})</span>
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Curated Course Learning Resources */}
                          {(() => {
                            const courseRes = getResourcesForCourse(course.name, course.description, course.mapped_skills);
                            return courseRes && courseRes.length > 0 ? (
                              <div className="mt-4 pt-3 border-t border-rose-100 space-y-2">
                                <span className="text-[11px] font-bold text-stone-900 uppercase tracking-wide flex items-center gap-1.5">
                                  <BookOpen className="w-3.5 h-3.5 text-rose-600" />
                                  Curated Course Learning Resources &amp; Lecture Materials:
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                  {courseRes.map((r, rIdx) => (
                                    <a
                                      key={rIdx}
                                      href={r.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-2.5 rounded-xl bg-gradient-to-r from-[#FFF5F7] to-white border border-rose-200 hover:border-rose-400 hover:shadow-xs transition-all flex flex-col justify-between group/res text-left"
                                    >
                                      <div>
                                        <div className="flex items-center justify-between gap-1 mb-1">
                                          <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-white text-stone-600 border border-rose-200">
                                            {r.type}
                                          </span>
                                          <span className="text-[10px] text-stone-400 font-medium">
                                            {r.provider}
                                          </span>
                                        </div>
                                        <h5 className="text-xs font-bold text-stone-900 group-hover/res:text-rose-700 transition-colors line-clamp-2">
                                          {r.title}
                                        </h5>
                                      </div>
                                      <div className="flex items-center gap-1 text-[10px] font-bold text-rose-600 group-hover/res:text-rose-800 mt-2">
                                        <span>Open Resource</span>
                                        <ExternalLink className="w-2.5 h-2.5" />
                                      </div>
                                    </a>
                                  ))}
                                </div>
                              </div>
                            ) : null;
                          })()}
                        </div>
                      ))}
                    </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* VIEW 2: STUDENT PATHWAY VIEW */}
        {activeRole === 'student' && (
          <StudentView 
            dashboardData={currentDisplayData}
            completedSkills={completedSkills}
            onToggleCompleteSkill={handleToggleCompleteSkill}
            onOpenResumeModal={() => setIsResumeModalOpen(true)}
          />
        )}

        {/* VIEW 3: INDUSTRY INSIGHTS VIEW */}
        {activeRole === 'industry' && (
          <IndustryView 
            jobsData={jobsData} 
            dashboardData={currentDisplayData}
            onOpenResumeModal={() => setIsResumeModalOpen(true)}
          />
        )}
      </main>

      {/* Dynamic File Upload Modal (Syllabus) */}
      <FileUploadModal 
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
        apiBase={API_BASE}
      />

      {/* Dynamic Resume Intelligence Modal */}
      <ResumeUploadModal
        isOpen={isResumeModalOpen}
        onClose={() => setIsResumeModalOpen(false)}
        jobsData={jobsData}
        curriculumId={selectedCurriculumId}
        apiBase={API_BASE}
      />
    </div>
  );
}
