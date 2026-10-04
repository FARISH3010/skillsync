import React, { useState } from 'react';
import { 
  CheckSquare, 
  Square, 
  CheckCircle2, 
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
    <div className="space-y-6">
      {/* Student Readiness Card */}
      <div className="bg-white border border-rose-200 rounded-2xl p-6 shadow-pink-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="badge-info text-xs mb-2">
            Student Career Preparation
          </span>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 font-['Hanken_Grotesk']">
            Skill Readiness &amp; Self-Directed Learning
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1.5 max-w-2xl leading-relaxed">
            Your academic curriculum covers 
            <strong className="text-rose-600"> {dashboardData.summary.overall_coverage_pct}%</strong> of entry-level engineering requirements.
            Address the remaining competencies through these targeted projects and micro-credentials.
          </p>
        </div>

        <div className="bg-[#FFF5F7] border border-rose-200 p-4 rounded-xl shrink-0 flex items-center gap-5 shadow-xs">
          <div>
            <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider block">Acquired</span>
            <div className="text-2xl font-black text-rose-600 font-mono mt-0.5">
              {completedSkills.length} / {missingSkills.length}
            </div>
          </div>
          <div className="w-12 h-12 rounded-full border-3 border-rose-200 border-t-rose-600 flex items-center justify-center font-bold text-xs font-mono text-stone-900">
            {missingSkills.length ? Math.round((completedSkills.length / missingSkills.length) * 100) : 0}%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Missing Skills Checklist */}
        <div className="lg:col-span-2 bg-white border border-rose-200 rounded-2xl p-6 shadow-pink-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-rose-600" />
                Self-Study Competency Checklist
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Mark competencies as completed as you study them or finish projects.
              </p>
            </div>
            <span className="badge-info text-xs">
              {missingSkills.length} Skills
            </span>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {missingSkills.map((skill) => {
              const isDone = completedSkills.includes(skill.skill_id);
              return (
                <div
                  key={skill.skill_id}
                  onClick={() => toggleComplete(skill.skill_id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                    isDone 
                      ? 'bg-[#F0FDF4] border-emerald-300 text-stone-600' 
                      : 'bg-white border-rose-200/90 hover:border-rose-400 shadow-xs'
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
                      <span className={`text-sm font-bold ${isDone ? 'line-through text-stone-400' : 'text-stone-900'}`}>
                        {skill.name}
                      </span>
                      <span className={skill.priority === 'HIGH' ? 'badge-critical text-[10px]' : 'badge-warning text-[10px]'}>
                        {skill.priority} DEMAND
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 mt-1">{skill.recommended_module}</p>
                    <div className="flex items-center gap-3 text-[11px] text-stone-500 mt-1.5">
                      <span>Category: {skill.category}</span>
                      <span>•</span>
                      <span className="font-mono text-rose-700 font-bold">{skill.market_frequency_pct}% employer demand</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Portfolio Project Recommendations */}
        <div className="bg-white border border-rose-200 rounded-2xl p-6 shadow-pink-card flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-stone-900 mb-1 flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-orange-500" />
              Recommended Capstone Projects
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Build these full-stack projects to validate proficiency in missing competencies.
            </p>

            <div className="space-y-3">
              {projectIdeas.map((project, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-gradient-to-b from-[#FFF5F7] to-white border border-rose-200/90 hover:border-rose-400 transition-all shadow-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="badge-info text-[10px]">
                      {project.portfolioImpact} Impact
                    </span>
                    <span className="text-[10px] text-stone-500 font-mono font-medium">
                      {project.difficulty}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-stone-900 mb-1">{project.title}</h4>
                  <p className="text-xs text-stone-600 mb-2.5 leading-relaxed">{project.description}</p>
                  
                  <div className="flex flex-wrap gap-1">
                    {project.skills.map((s, sIdx) => (
                      <span key={sIdx} className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-rose-200 text-stone-700 font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-rose-100 text-center">
            <span className="text-xs text-emerald-800 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-block">
              ✓ {coveredSkills.length} Core Skills taught in your syllabus
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

