import React, { useState } from 'react';
import { 
  CheckSquare, 
  Square, 
  ExternalLink, 
  BookOpen, 
  Award, 
  Sparkles, 
  CheckCircle2, 
  ArrowUpRight,
  Code2,
  FolderGit2
} from 'lucide-react';

export default function StudentView({ dashboardData }) {
  const [completedSkills, setCompletedSkills] = useState([]);

  if (!dashboardData) return null;

  // Filter skills that are not taught in the baseline syllabus
  const missingSkills = (dashboardData.skills || []).filter(s => !s.in_curriculum);
  const coveredSkills = (dashboardData.skills || []).filter(s => s.in_curriculum);

  const toggleComplete = (id) => {
    if (completedSkills.includes(id)) {
      setCompletedSkills(completedSkills.filter(i => i !== id));
    } else {
      setCompletedSkills([...completedSkills, id]);
    }
  };

  // Dynamic capstone project ideas from domain benchmark or fallback
  const domainName = dashboardData?.summary?.domain_name || "Specialization";
  const defaultProjects = [
    {
      title: "Cloud-Native Microservices E-Commerce Platform",
      skills: ["Docker & Containerization", "Kubernetes", "Redis & Caching", "PostgreSQL"],
      description: "Build an asynchronous checkout pipeline deployed with Docker & Kubernetes, using Redis caching and PostgreSQL ACID transactions.",
      difficulty: "Advanced",
      portfolioImpact: "High"
    },
    {
      title: "Full-Stack AI Knowledge Assistant (RAG Engine)",
      skills: ["Generative AI & LLMs", "FastAPI / Python", "Next.js", "Docker"],
      description: "Implement a hybrid document question-answering app using Gemini/OpenAI API, vector embeddings, and Next.js frontend.",
      difficulty: "Intermediate",
      portfolioImpact: "Very High"
    },
    {
      title: "Real-Time Event-Driven Notification Service",
      skills: ["Kafka & Event Streaming", "Node.js & Express", "CI/CD Automation"],
      description: "Architect a scalable pub/sub event pipeline with Apache Kafka, automated GitHub Actions CI/CD, and unit tests.",
      difficulty: "Intermediate",
      portfolioImpact: "High"
    }
  ];

  const projectIdeas = (dashboardData.portfolio_projects && dashboardData.portfolio_projects.length > 0)
    ? dashboardData.portfolio_projects
    : defaultProjects;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Student Readiness Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 relative overflow-hidden shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Student Personalized Career Launchpad
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
              Skill Readiness & Self-Directed Learning
            </h2>
            <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
              Based on active Indian tech market demand, your academic syllabus covers 
              <strong className="text-indigo-400"> {dashboardData.summary.overall_coverage_pct}%</strong> of entry-level engineering requirements.
              Bridge the remaining competencies through these targeted projects and micro-credentials.
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-700 p-5 rounded-2xl shrink-0 flex items-center gap-6">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Self-Acquired</span>
              <div className="text-2xl font-bold text-emerald-400 font-display">
                {completedSkills.length} / {missingSkills.length}
              </div>
            </div>
            <div className="w-16 h-16 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 flex items-center justify-center font-bold text-white text-sm">
              {missingSkills.length ? Math.round((completedSkills.length / missingSkills.length) * 100) : 0}%
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Missing Skills Checklist */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-indigo-400" />
                Industry Gap Checklist (What to Learn on Your Own)
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Mark skills as completed as you study them or complete projects.
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-400 bg-slate-800 px-3 py-1 rounded-lg">
              {missingSkills.length} Target Skills
            </span>
          </div>

          <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
            {missingSkills.map((skill) => {
              const isDone = completedSkills.includes(skill.skill_id);
              return (
                <div
                  key={skill.skill_id}
                  onClick={() => toggleComplete(skill.skill_id)}
                  className={`p-4 rounded-2xl border transition cursor-pointer flex items-start gap-4 ${
                    isDone 
                      ? 'bg-emerald-950/20 border-emerald-500/40 text-slate-200' 
                      : 'bg-slate-850/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <button className="mt-0.5 text-indigo-400 hover:text-indigo-300 transition">
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-500" />
                    )}
                  </button>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-bold font-display ${isDone ? 'line-through text-slate-400' : 'text-slate-100'}`}>
                        {skill.name}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        skill.priority === 'HIGH' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {skill.priority} DEMAND
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{skill.recommended_module}</p>
                    <div className="flex items-center gap-4 text-[11px] text-slate-500 mt-2">
                      <span>Category: {skill.category}</span>
                      <span className="text-indigo-400 font-medium">{skill.market_frequency_pct}% of employers demand this</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Portfolio Project Recommendations */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white font-display mb-2 flex items-center gap-2">
              <FolderGit2 className="w-5 h-5 text-cyan-400" />
              High-Impact Resume Projects
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Build these full-stack projects to demonstrate mastery in missing syllabus competencies.
            </p>

            <div className="space-y-4">
              {projectIdeas.map((project, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-850/70 border border-slate-700/60 hover:border-indigo-500/40 transition">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                      {project.portfolioImpact} Impact
                    </span>
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                      {project.difficulty}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-100 mb-1">{project.title}</h4>
                  <p className="text-xs text-slate-300 mb-3">{project.description}</p>
                  
                  <div className="flex flex-wrap gap-1.5">
                    {project.skills.map((s, sIdx) => (
                      <span key={sIdx} className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-center">
            <span className="text-xs text-slate-400 block mb-1">Looking for syllabus coverage?</span>
            <span className="text-xs text-emerald-400 font-semibold">
              ✓ {coveredSkills.length} Foundation Skills already covered in your classes
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
