import React, { useState } from 'react';
import { 
  CheckSquare, 
  Square, 
  CheckCircle2, 
  FolderGit2,
  ChevronDown,
  ChevronUp,
  FileText,
  Sparkles,
  ArrowRight,
  Target
} from 'lucide-react';

export default function StudentView({ 
  dashboardData, 
  completedSkills = [], 
  onToggleCompleteSkill,
  onOpenResumeModal 
}) {
  // Collapsible dropdown states to keep UI decluttered
  const [isChecklistOpen, setIsChecklistOpen] = useState(true);
  const [isProjectsOpen, setIsProjectsOpen] = useState(true);

  if (!dashboardData) return null;

  // Filter skills that are not taught in the baseline syllabus
  const missingSkills = (dashboardData.skills || []).filter(s => !s.in_curriculum);
  const coveredSkills = (dashboardData.skills || []).filter(s => s.in_curriculum);

  const domainName = dashboardData?.summary?.domain_name || "Specialization";
  const defaultProjects = [
    {
      title: "Cloud-Native Microservices E-Commerce Platform",
      skills: ["Docker & Containerization", "Kubernetes", "Redis & Caching", "PostgreSQL"],
      description: "Build an asynchronous checkout pipeline deployed with Docker & Kubernetes, using Redis caching and PostgreSQL ACID transactions.",
      difficulty: "Advanced",
      portfolioImpact: "High",
      bridged_gap_summary: "Bridges Containerization, Cloud Deployment, and In-Memory Caching demands"
    },
    {
      title: "Full-Stack AI Knowledge Assistant (RAG Engine)",
      skills: ["Generative AI & LLMs", "FastAPI / Python", "Next.js", "Docker"],
      description: "Implement a hybrid document question-answering app using Gemini/OpenAI API, vector embeddings, and Next.js frontend.",
      difficulty: "Intermediate",
      portfolioImpact: "Very High",
      bridged_gap_summary: "Directly bridges Generative AI, Vector Search, and Modern Full-Stack API demands"
    },
    {
      title: "Real-Time Event-Driven Streaming Pipeline",
      skills: ["Kafka & Event Streaming", "Node.js & Express", "CI/CD Automation", "PostgreSQL"],
      description: "Architect a scalable pub/sub event pipeline with Apache Kafka, automated GitHub Actions CI/CD, and integration test suites.",
      difficulty: "Intermediate",
      portfolioImpact: "High",
      bridged_gap_summary: "Bridges Event-Driven Architecture, Pub/Sub Queues, and Production CI/CD pipelines"
    }
  ];

  const projectIdeas = (dashboardData.portfolio_projects && dashboardData.portfolio_projects.length > 0)
    ? dashboardData.portfolio_projects
    : defaultProjects;

  const completedCount = completedSkills.length;
  const totalMissing = missingSkills.length;
  const progressPct = totalMissing > 0 ? Math.round((completedCount / totalMissing) * 100) : 0;

  return (
    <div className="space-y-6">
      
      {/* 1. Student Readiness & Diagnostic Action Banner */}
      <div className="bg-white border border-rose-200 rounded-2xl p-6 shadow-pink-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="badge-info text-xs">
              Student Career Pathway &amp; Placement Engine
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 uppercase">
              Live Gap Integration
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 font-['Hanken_Grotesk']">
            Skill Readiness &amp; Actionable Capstones
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1.5 max-w-2xl leading-relaxed">
            Your academic curriculum currently aligns with 
            <strong className="text-rose-600"> {dashboardData.summary.overall_coverage_pct}%</strong> of target industry hiring criteria.
            Completing checklist competencies below directly updates your curricular alignment score.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
          {/* Progress Pill */}
          <div className="bg-[#FFF5F7] border border-rose-200 p-4 rounded-xl flex items-center gap-4 shadow-xs">
            <div>
              <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider block">Acquired Gaps</span>
              <div className="text-2xl font-black text-rose-600 font-mono mt-0.5">
                {completedCount} / {totalMissing}
              </div>
            </div>
            <div className="w-12 h-12 rounded-full border-3 border-rose-200 border-t-rose-600 flex items-center justify-center font-bold text-xs font-mono text-stone-900">
              {progressPct}%
            </div>
          </div>

          {/* Upload Resume CTA */}
          {onOpenResumeModal && (
            <button
              onClick={onOpenResumeModal}
              className="btn-primary text-xs px-4 py-3 flex items-center gap-2 shadow-md cursor-pointer whitespace-nowrap"
            >
              <FileText className="w-4 h-4" />
              <span>Diagnostic Resume Check</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Collapsible Grid: Checklist & Capstone Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COMPONENT: Missing Skills Checklist (Collapsible Dropdown) */}
        <div className="lg:col-span-7 bg-white border border-rose-200 rounded-2xl p-5 shadow-pink-card space-y-4">
          
          {/* Dropdown Header Trigger */}
          <div 
            onClick={() => setIsChecklistOpen(!isChecklistOpen)}
            className="flex items-center justify-between cursor-pointer select-none pb-2 border-b border-rose-100 group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center group-hover:bg-rose-200 transition-colors">
                <CheckSquare className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-900 group-hover:text-rose-700 transition-colors flex items-center gap-2">
                  Missing Competencies Checklist
                  <span className="text-xs font-normal text-stone-400 font-mono">({completedCount}/{totalMissing} done)</span>
                </h3>
                <p className="text-xs text-stone-500">
                  Checking off done skills immediately reflects into the Curricular Skill Gap &amp; Lift matrix.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="badge-info text-xs">
                {missingSkills.length} Demanded Gaps
              </span>
              <button className="p-1 rounded-lg text-stone-400 group-hover:text-stone-700 transition-colors">
                {isChecklistOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Collapsible Content */}
          {isChecklistOpen && (
            <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1 animate-fade-in">
              {missingSkills.map((skill) => {
                const isDone = completedSkills.includes(skill.skill_id);
                return (
                  <div
                    key={skill.skill_id}
                    onClick={() => onToggleCompleteSkill && onToggleCompleteSkill(skill.skill_id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                      isDone 
                        ? 'bg-[#F0FDF4] border-emerald-300 text-stone-700 shadow-xs' 
                        : 'bg-white border-rose-200/90 hover:border-rose-400 shadow-xs hover:bg-[#FFF5F7]/40'
                    }`}
                  >
                    <button className="mt-0.5 text-rose-600 cursor-pointer">
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Square className="w-4 h-4 text-stone-400" />
                      )}
                    </button>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${isDone ? 'line-through text-stone-400 font-normal' : 'text-stone-900'}`}>
                          {skill.name}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {isDone ? (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                              ✓ Reflected in Matrix
                            </span>
                          ) : (
                            <span className={skill.priority === 'HIGH' ? 'badge-critical text-[10px]' : 'badge-warning text-[10px]'}>
                              {skill.priority} DEMAND
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
                        {skill.recommended_module || `Recommended: Applied ${skill.name} Practicum`}
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-stone-500 mt-1">
                        <span>Category: {skill.category}</span>
                        <span>•</span>
                        <span className="font-mono text-rose-700 font-bold">{skill.market_frequency_pct}% employer demand</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT COMPONENT: Capstone Projects (Collapsible Dropdown & Bridging Integration) */}
        <div className="lg:col-span-5 bg-white border border-rose-200 rounded-2xl p-5 shadow-pink-card space-y-4">
          
          {/* Dropdown Header Trigger */}
          <div 
            onClick={() => setIsProjectsOpen(!isProjectsOpen)}
            className="flex items-center justify-between cursor-pointer select-none pb-2 border-b border-rose-100 group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                <FolderGit2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-900 group-hover:text-rose-700 transition-colors flex items-center gap-2">
                  Skill-Bridging Capstone Projects
                </h3>
                <p className="text-xs text-stone-500">
                  Targeted portfolio deliverables to bridge critical employer demands.
                </p>
              </div>
            </div>

            <button className="p-1 rounded-lg text-stone-400 group-hover:text-stone-700 transition-colors">
              {isProjectsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {/* Collapsible Content */}
          {isProjectsOpen && (
            <div className="space-y-3.5 max-h-[520px] overflow-y-auto pr-1 animate-fade-in">
              {projectIdeas.map((project, idx) => (
                <div 
                  key={idx} 
                  className="p-4 rounded-xl bg-gradient-to-b from-[#FFF5F7] to-white border border-rose-200 hover:border-rose-400 transition-all shadow-xs space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="badge-info text-[10px]">
                      {project.portfolioImpact} Portfolio Impact
                    </span>
                    <span className="text-[10px] text-stone-500 font-mono font-medium">
                      {project.difficulty}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-stone-900">{project.title}</h4>
                  
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {project.description}
                  </p>

                  {/* Bridged Demanded Skills Badge */}
                  {project.bridged_gap_summary && (
                    <div className="p-2 rounded-lg bg-emerald-50/70 border border-emerald-200 text-emerald-800 text-[11px] flex items-center gap-1.5 font-medium">
                      <Target className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{project.bridged_gap_summary}</span>
                    </div>
                  )}
                  
                  <div>
                    <span className="text-[10px] font-bold text-rose-800 uppercase block mb-1">
                      Integrated Demanded Skills:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {project.skills.map((s, sIdx) => (
                        <span key={sIdx} className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-rose-200 text-stone-700 font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              <div className="pt-2 text-center">
                <span className="text-xs text-emerald-800 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-block">
                  ✓ {coveredSkills.length} Core Curriculum competencies taught in baseline syllabus
                </span>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
