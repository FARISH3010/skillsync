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
  ShieldAlert,
  ArrowUpRight,
  Sun,
  Moon
} from 'lucide-react';

import FileUploadModal from './components/FileUploadModal';
import SimulatorView from './components/SimulatorView';
import StudentView from './components/StudentView';
import IndustryView from './components/IndustryView';
import CircularCoverageGauge from './components/CircularCoverageGauge';
import { exportReportToCSV, exportReportToPDF } from './utils/reportExporter';

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

  const currentDisplayData = simulationResult || dashboardData;
  const baselinePct = Number(dashboardData?.summary?.baseline_coverage_pct ?? dashboardData?.summary?.overall_coverage_pct ?? 54.2);
  const currentCoveragePct = Number(currentDisplayData?.summary?.overall_coverage_pct ?? 54.2);
  const simulatedGainPct = Number(currentDisplayData?.summary?.simulated_gain_pct ?? (currentCoveragePct - baselinePct).toFixed(1));

  // Category filters for the recommendation / priority heatmap
  const rawSkills = currentDisplayData?.skills || [];
  const heatmapCategories = ['ALL', ...Array.from(new Set(rawSkills.map(s => s.category)))];
  const filteredSkills = rawSkills.filter(s => {
    if (heatmapCategoryFilter === 'ALL') return true;
    return s.category === heatmapCategoryFilter;
  });

  if (loading && !dashboardData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0B0F19] text-slate-100">
        <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mb-4">
          <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
        </div>
        <h2 className="text-xl font-bold font-display text-white">SkillSync Intelligence Engine</h2>
        <p className="text-sm font-medium text-slate-400 mt-1">Connecting to spaCy, Pandas, & Gemini API...</p>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0B0F19] p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8 text-rose-500" />
        </div>
        <h2 className="text-2xl font-bold font-display text-white mb-2">Backend Connection Offline</h2>
        <p className="text-slate-400 max-w-md mb-6">{error}. Ensure the backend service is running on port 8000.</p>
        <button 
          onClick={() => fetchData(selectedCurriculumId)} 
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-semibold transition shadow-lg shadow-indigo-500/25"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#0B0F19] text-slate-100' : 'bg-slate-50 text-slate-900'} bg-cyber-grid bg-ambient-cockpit flex flex-col transition-colors duration-300`}>
      
      {/* 1. TOP GLASS HEADER NAVBAR */}
      <header className={`sticky top-0 z-40 ${theme === 'dark' ? 'bg-[#0B0F19]/85' : 'bg-white/85'} backdrop-blur-xl border-b border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between`}>
        
        {/* Brand Logo & Hexagonal Matrix Icon */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/30 ring-1 ring-white/20">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`font-extrabold text-xl tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'} font-display`}>
                Skill<span className="text-indigo-500">Sync</span>
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                v4.2 AI
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium hidden md:block">
              Curriculum Intelligence Platform
            </p>
          </div>
        </div>

        {/* Live Status Indicator */}
        <div className="hidden lg:flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-medium text-slate-300">
            <strong className="text-emerald-400 font-mono">{jobsData.length || 10} Job Postings</strong> Synced (Live Demand Feed)
          </span>
        </div>

        {/* Header Right Action Group */}
        <div className="flex items-center gap-3">
          {/* Light / Dark Mode Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-center ${
              theme === 'dark'
                ? 'bg-slate-900/90 border-slate-700/80 text-amber-400 hover:bg-slate-800 hover:text-amber-300 shadow-md'
                : 'bg-white border-slate-200 text-indigo-600 hover:bg-slate-100 hover:text-indigo-700 shadow-sm'
            }`}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 transition-transform hover:rotate-45" />
            ) : (
              <Moon className="w-4 h-4 transition-transform hover:-rotate-12" />
            )}
          </button>

          {/* Syllabus Switcher */}
          {curriculaList.length > 1 && (
            <select
              value={selectedCurriculumId}
              onChange={(e) => handleSelectCurriculum(e.target.value)}
              className="bg-slate-900/90 border border-slate-700/80 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 hidden sm:block font-medium"
            >
              {curriculaList.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          )}

          {/* Primary CTA: Glowing Shimmer Upload Button */}
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 shimmer-button text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-indigo-500/25 transition cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>+ Upload Syllabus PDF</span>
          </button>
        </div>
      </header>

      {/* 2. FLOATING SEGMENTED ROLE NAVIGATION BAR */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 pt-6 pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Segmented Glass Pill Switcher */}
          <div className="inline-flex bg-slate-900/80 p-1.5 rounded-2xl border border-white/10 backdrop-blur-xl shadow-xl">
            <button
              onClick={() => { setActiveRole('faculty'); setActiveTab('dashboard'); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
                activeRole === 'faculty'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>🎓 Academic Planner</span>
            </button>

            <button
              onClick={() => { setActiveRole('student'); setActiveTab('student'); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
                activeRole === 'student'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>🚀 Student Pathway</span>
            </button>

            <button
              onClick={() => { setActiveRole('industry'); setActiveTab('jobs'); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
                activeRole === 'industry'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>💼 Industry Insights</span>
            </button>
          </div>

          {/* Academic Planner Subtab Navigation */}
          {activeRole === 'faculty' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition border ${
                  activeTab === 'dashboard'
                    ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40 shadow-sm'
                    : 'text-slate-400 border-transparent hover:text-slate-200'
                }`}
              >
                Executive Gap Matrix
              </button>
              <button
                onClick={() => setActiveTab('simulator')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition border ${
                  activeTab === 'simulator'
                    ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40 shadow-sm'
                    : 'text-slate-400 border-transparent hover:text-slate-200'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                What-If Simulator
                {simulatedSkills.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-ping" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('curriculum')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition border ${
                  activeTab === 'curriculum'
                    ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40 shadow-sm'
                    : 'text-slate-400 border-transparent hover:text-slate-200'
                }`}
              >
                Course Catalog
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. MAIN DASHBOARD VIEWPORT */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 py-6 space-y-8">
        
        {/* VIEW 1: ACADEMIC PLANNER */}
        {activeRole === 'faculty' && (
          <>
            {/* SUBTAB: EXECUTIVE GAP MATRIX */}
            {activeTab === 'dashboard' && currentDisplayData && (
              <div className="space-y-8 animate-fade-in">
                
                {/* HERO EXECUTIVE IMPACT ROW */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Left Hero Card: Circular SVG Gauge */}
                  <div className="lg:col-span-5 glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
                    
                    <div className="space-y-3 z-10 text-center sm:text-left">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-mono font-medium">
                        <Sparkles className="w-3 h-3 text-cyan-400" />
                        {currentDisplayData.summary?.domain_name || 'Academic & Industry Intelligence'}
                      </div>
                      <h3 className="text-xl font-extrabold text-white font-display">
                        {currentDisplayData.curriculum?.title || 'Curriculum Market Alignment'}
                      </h3>
                      <p className="text-xs text-slate-300 max-w-sm leading-relaxed">
                        {currentDisplayData.summary?.executive_summary || 'Forensic comparison of syllabus competencies against real-time industry demand frequency and workforce requirements.'}
                      </p>
                      <div className="pt-2 text-xs text-slate-400 font-mono">
                        Institution: <span className="text-slate-200 font-bold">{dashboardData?.curriculum?.institution || 'Academic Council'}</span>
                      </div>
                    </div>

                    <div className="shrink-0 z-10">
                      <CircularCoverageGauge 
                        baselinePct={baselinePct} 
                        currentPct={currentCoveragePct} 
                        size={175} 
                      />
                    </div>
                  </div>

                  {/* Right KPI Metric Grid: 3 Glass Cards */}
                  <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-6">
                    
                    {/* Critical Missing Skills (Crimson Highlight) */}
                    <div className="glass-panel p-6 rounded-3xl border border-white/10 border-l-4 border-l-rose-500 flex flex-col justify-between shadow-xl">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-300 font-mono">
                            Critical Gaps
                          </span>
                          <span className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
                            <ShieldAlert className="w-4 h-4" />
                          </span>
                        </div>
                        <div className="text-3xl sm:text-4xl font-extrabold text-rose-400 font-mono">
                          {currentDisplayData.summary.critical_gaps_count}
                        </div>
                        <p className="text-xs text-slate-400 mt-2">
                          Acute deficiencies in high-frequency hiring posts (≥60% demand).
                        </p>
                      </div>
                      <div className="pt-3 border-t border-slate-800 text-[11px] text-rose-400/90 font-medium">
                        Immediate revision recommended
                      </div>
                    </div>

                    {/* Jobs Postings Analyzed (Indigo Card) */}
                    <div className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col justify-between shadow-xl">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 font-mono">
                            Demand Benchmark
                          </span>
                          <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
                            <Briefcase className="w-4 h-4" />
                          </span>
                        </div>
                        <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono">
                          {currentDisplayData.summary.total_industry_jobs_analyzed} Roles
                        </div>
                        <p className="text-xs text-slate-400 mt-2">
                          Scanned across {currentDisplayData.summary.total_skills_tracked} taxonomy competencies.
                        </p>
                      </div>
                      <div className="pt-3 border-t border-slate-800 text-[11px] text-indigo-300 font-medium font-mono">
                        Active hiring telemetry
                      </div>
                    </div>

                    {/* Simulated Coverage Gain (Emerald Badge) */}
                    <div className="glass-panel p-6 rounded-3xl border border-white/10 border-l-4 border-l-emerald-500 flex flex-col justify-between shadow-xl">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 font-mono">
                            Projected Gain
                          </span>
                          <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                            <TrendingUp className="w-4 h-4" />
                          </span>
                        </div>
                        <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-mono">
                          +{simulatedGainPct}%
                        </div>
                        <p className="text-xs text-slate-400 mt-2">
                          Simulated improvement potential via elective additions.
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveTab('simulator')}
                        className="pt-3 border-t border-slate-800 text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center justify-between"
                      >
                        <span>Open Simulator</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                </div>

                {/* SKILL GAP PRIORITY HEATMAP & RECOMMENDATIONS GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Left 8 Cols: Skill Gap Heatmap Table */}
                  <div className="lg:col-span-8 glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 space-y-5 shadow-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
                          <Layers className="w-5 h-5 text-indigo-400" />
                          Skill Gap Priority Matrix
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Prioritized by market demand score and syllabus alignment
                        </p>
                      </div>

                      {/* Filter category pills */}
                      <div className="flex flex-wrap gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
                        {heatmapCategories.map(cat => (
                          <button
                            key={cat}
                            onClick={() => setHeatmapCategoryFilter(cat)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                              heatmapCategoryFilter === cat 
                                ? 'bg-indigo-600 text-white shadow-sm' 
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* High-Fidelity Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase font-bold font-mono">
                            <th className="pb-3">Competency / Skill</th>
                            <th className="pb-3">Category</th>
                            <th className="pb-3">Industry Demand</th>
                            <th className="pb-3">Syllabus Status</th>
                            <th className="pb-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 font-sans">
                          {filteredSkills.map((skill) => {
                            const isSimulated = simulatedSkills.includes(skill.skill_id);

                            return (
                              <tr key={skill.skill_id} className="hover:bg-slate-850/50 transition">
                                <td className="py-3 font-semibold text-slate-200">
                                  <div className="flex items-center gap-2">
                                    <span>{skill.name}</span>
                                    {isSimulated && (
                                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                                        SIM
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="py-3 text-slate-400 text-xs">{skill.category}</td>
                                <td className="py-3">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-slate-200 font-mono text-xs w-9">
                                      {skill.market_frequency_pct}%
                                    </span>
                                    <div className="w-20 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                      <div 
                                        className={`h-full rounded-full transition-all duration-500 ${
                                          skill.market_frequency_pct >= 60 ? 'bg-indigo-400' : 'bg-slate-500'
                                        }`} 
                                        style={{ width: `${skill.market_frequency_pct}%` }} 
                                      />
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3">
                                  {skill.is_covered || isSimulated ? (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      {isSimulated ? 'Simulated' : 'Covered'}
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                      <XCircle className="w-3.5 h-3.5" /> Missing
                                    </span>
                                  )}
                                </td>
                                <td className="py-3 text-right">
                                  {!skill.is_covered && (
                                    <button
                                      onClick={() => handleToggleSimulatedSkill(skill.skill_id)}
                                      className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition border ${
                                        isSimulated
                                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30 hover:bg-rose-500/30'
                                          : 'bg-indigo-600/20 text-indigo-300 border-indigo-500/30 hover:bg-indigo-600/30'
                                      }`}
                                    >
                                      {isSimulated ? 'Remove' : '+ Simulate'}
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Right 4 Cols: Actionable Module Recommendations */}
                  <div className="lg:col-span-4 space-y-6">
                    <div className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col shadow-xl">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-indigo-400" />
                          Recommended Interventions
                        </h3>
                        <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                          {currentDisplayData.recommendations.length} Modules
                        </span>
                      </div>

                      <div className="space-y-3.5 flex-1 overflow-y-auto max-h-[460px] pr-1">
                        {currentDisplayData.recommendations.map((rec) => (
                          <div 
                            key={rec.skill_id}
                            className="p-4 rounded-2xl bg-slate-850/60 border border-slate-700/60 hover:border-indigo-500/50 transition group"
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="font-bold text-slate-200 text-sm font-display group-hover:text-indigo-300 transition">
                                {rec.skill_name}
                              </span>
                              <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase ${
                                rec.priority === 'HIGH' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              }`}>
                                {rec.priority} PRIORITY
                              </span>
                            </div>

                            <p className="text-xs text-slate-300 font-medium mb-3 leading-relaxed">
                              {rec.recommended_action}
                            </p>

                            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2.5 border-t border-slate-800">
                              <span>{rec.category}</span>
                              <span className="text-emerald-400 font-mono font-semibold">
                                +{rec.impact_gain_pct}% Fit Gain
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Export buttons */}
                      <div className="pt-4 mt-4 border-t border-slate-800 flex items-center gap-2">
                        <button
                          onClick={() => exportReportToPDF(currentDisplayData)}
                          className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/20"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Export PDF Proposal
                        </button>
                        <button
                          onClick={() => exportReportToCSV(currentDisplayData)}
                          className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition border border-slate-700 flex items-center justify-center"
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
              <div className="space-y-6 animate-fade-in">
                <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-white font-display">{curriculumData.title}</h3>
                      <p className="text-xs sm:text-sm text-slate-400 mt-1">
                        Syllabus course catalog mapped with NLP token and concept extractions.
                      </p>
                    </div>
                    <span className="px-3.5 py-1.5 bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 rounded-xl text-xs font-semibold shrink-0">
                      {curriculumData.courses.length} Accredited Courses
                    </span>
                  </div>

                  <div className="space-y-4">
                    {curriculumData.courses.map((course) => (
                      <div key={course.code} className="bg-slate-850/60 border border-slate-700/60 p-5 rounded-2xl">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="px-2.5 py-1 bg-indigo-600/30 text-indigo-300 rounded-lg font-mono text-xs font-bold border border-indigo-500/30">
                            {course.code}
                          </span>
                          <h4 className="text-base font-bold text-slate-100 font-display">{course.name}</h4>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-300 mb-4 leading-relaxed">
                          {course.description}
                        </p>
                        
                        <div>
                          <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 block mb-2 font-mono">
                            Extracted Competency Tags:
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {course.mapped_skills.map((s, idx) => (
                              <span 
                                key={idx} 
                                className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-indigo-950/40 border border-indigo-700/50 text-indigo-300 flex items-center gap-1.5"
                              >
                                <Sparkles className="w-3 h-3 text-cyan-400" />
                                {s.skill_name}
                                <span className="text-slate-400 text-[10px]">({s.matched_mention})</span>
                              </span>
                            ))}
                          </div>
                        </div>
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
          <StudentView dashboardData={dashboardData} />
        )}

        {/* VIEW 3: INDUSTRY INSIGHTS VIEW */}
        {activeRole === 'industry' && (
          <IndustryView jobsData={jobsData} dashboardData={dashboardData} />
        )}
      </main>

      {/* Dynamic File Upload Modal */}
      <FileUploadModal 
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
        apiBase={API_BASE}
      />
    </div>
  );
}
