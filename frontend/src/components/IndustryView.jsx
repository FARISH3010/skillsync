import React, { useState } from 'react';
import { 
  Briefcase, 
  MapPin, 
  Building2, 
  Flame,
  ChevronDown,
  ChevronUp,
  FileText,
  CheckCircle2,
  ListChecks,
  ExternalLink
} from 'lucide-react';

export default function IndustryView({ 
  jobsData = [], 
  dashboardData,
  onOpenResumeModal 
}) {
  // Collapsible state for Demanded Competencies to keep the viewport clean and free up space
  const [isCompetenciesOpen, setIsCompetenciesOpen] = useState(false);
  const [activeJobFilter, setActiveJobFilter] = useState('ALL');

  if (!dashboardData) return null;

  // Compute top demanded skills across job postings
  const sortedSkills = [...(dashboardData.skills || [])].sort(
    (a, b) => b.market_frequency_pct - a.market_frequency_pct
  );

  const domainName = dashboardData?.summary?.domain_name || "Industry";
  const marketRoles = dashboardData?.market_roles || [];

  return (
    <div className="space-y-6">
      
      {/* 1. Industry Overview Banner */}
      <div className="bg-white border border-rose-200 rounded-2xl p-6 shadow-pink-card flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="badge-info text-xs">
              Hiring Intelligence &amp; Job Profiles
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 uppercase">
              Role Telemetry
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 font-['Hanken_Grotesk']">
            {domainName} Market Demand &amp; Placement Tracks
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1.5 max-w-2xl leading-relaxed">
            Real-time hiring telemetry synthesized from {jobsData.length} active requisitions with full responsibility breakdowns, day-to-day duties, and demanded technical stacks.
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#FFF5F7] border border-rose-200 p-4 rounded-xl shadow-xs">
              <span className="text-[11px] uppercase tracking-wider text-rose-800 font-bold block">
                Top Demanded
              </span>
              <div className="text-sm font-bold text-stone-900 mt-1 truncate max-w-[130px]" title={sortedSkills[0]?.name}>
                {sortedSkills[0]?.name || 'Domain Skill'}
              </div>
              <span className="text-xs text-rose-600 font-mono font-bold">
                {sortedSkills[0]?.market_frequency_pct || 85}% Frequency
              </span>
            </div>

            <div className="bg-[#FFF5F7] border border-rose-200 p-4 rounded-xl shadow-xs">
              <span className="text-[11px] uppercase tracking-wider text-stone-600 font-bold block">
                Tracked Roles
              </span>
              <div className="text-sm font-bold text-stone-900 mt-1">
                {jobsData.length} Active Tracks
              </div>
              <span className="text-xs text-orange-600 font-bold">
                Verified Benchmark
              </span>
            </div>
          </div>

          {/* Diagnostic Resume Check Trigger */}
          {onOpenResumeModal && (
            <button
              onClick={onOpenResumeModal}
              className="btn-primary text-xs px-4 py-3 flex items-center gap-2 shadow-md cursor-pointer whitespace-nowrap"
            >
              <FileText className="w-4 h-4" />
              <span>Check Resume Fit</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Minimized / Collapsible Demanded Competencies Section */}
      <div className="bg-white border border-rose-200 rounded-2xl shadow-pink-card overflow-hidden">
        <div 
          onClick={() => setIsCompetenciesOpen(!isCompetenciesOpen)}
          className="p-4 px-6 flex items-center justify-between cursor-pointer select-none bg-gradient-to-r from-[#FFF5F7] to-white hover:bg-rose-50/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <Flame className="w-4 h-4 text-orange-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                Demanded Competencies &amp; Market Frequency
                <span className="text-xs font-normal text-stone-500 font-mono">({sortedSkills.length} competencies tracked)</span>
              </h3>
              <p className="text-xs text-stone-500">
                {isCompetenciesOpen ? 'Click to minimize and maximize screen space' : 'Collapsed by default to keep the workspace clean. Click to expand.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
              {isCompetenciesOpen ? 'Hide Leaderboard' : 'View Competencies'}
            </span>
            <button className="p-1 rounded-lg text-stone-400">
              {isCompetenciesOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {isCompetenciesOpen && (
          <div className="p-6 pt-2 border-t border-rose-100 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[360px] overflow-y-auto pr-1">
              {sortedSkills.slice(0, 15).map((skill, rank) => (
                <div 
                  key={skill.skill_id}
                  className="p-3 rounded-xl bg-gradient-to-r from-[#FFF5F7] to-white border border-rose-200 flex items-center justify-between hover:border-rose-300 transition-colors shadow-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold font-mono ${
                      rank < 3 
                        ? 'bg-gradient-to-tr from-rose-500 to-orange-500 text-white shadow-xs' 
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {rank + 1}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-stone-900">{skill.name}</h4>
                      <span className="text-[11px] text-stone-500">{skill.category}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-rose-700 font-mono">
                      {skill.market_frequency_pct}%
                    </span>
                    <div className="w-14 bg-rose-100 h-1.5 rounded-full mt-1 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-rose-500 to-orange-500 h-full rounded-full" 
                        style={{ width: `${skill.market_frequency_pct}%` }} 
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. Detailed Job Profiles & Full Responsibilities */}
      <div className="bg-white border border-rose-200 rounded-2xl p-6 shadow-pink-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-rose-100">
          <div>
            <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-orange-500" />
              Industry Requisitions &amp; Role Responsibilities
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Specific day-to-day duties and technical expectations for each career track.
            </p>
          </div>
          <span className="badge-info text-xs self-start sm:self-auto">
            {jobsData.length} Profiles
          </span>
        </div>

        <div className="space-y-4">
          {jobsData.map((job) => (
            <div 
              key={job.id}
              className="p-5 rounded-2xl bg-gradient-to-b from-[#FFF5F7] to-white border border-rose-200 hover:border-rose-300 transition-all shadow-xs space-y-3.5"
            >
              {/* Job Title & Metadata */}
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                    {job.title}
                  </h4>
                  <div className="text-xs text-stone-500 flex flex-wrap items-center gap-2 mt-1">
                    <span className="flex items-center gap-1 font-semibold text-stone-800">
                      <Building2 className="w-3.5 h-3.5 text-rose-500" /> 
                      {job.company}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" /> 
                      {job.location}
                    </span>
                    <span>•</span>
                    <span className="font-mono text-[11px] font-medium text-stone-600 bg-white px-2 py-0.5 rounded border border-rose-200">
                      Exp: {job.experience}
                    </span>
                  </div>
                </div>

                {onOpenResumeModal && (
                  <button
                    onClick={onOpenResumeModal}
                    className="text-xs text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 bg-white hover:bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200 transition-colors cursor-pointer"
                  >
                    <span>Check Fit For This Role</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Role Summary */}
              <p className="text-xs text-stone-700 leading-relaxed font-normal">
                {job.description}
              </p>

              {/* WHAT THEY WILL DO / SPECIFIC RESPONSIBILITIES */}
              <div className="bg-white/90 p-4 rounded-xl border border-rose-100 space-y-2">
                <span className="text-[11px] font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                  <ListChecks className="w-3.5 h-3.5 text-rose-600" />
                  What You Will Do (Day-to-Day Responsibilities):
                </span>
                
                {job.responsibilities && job.responsibilities.length > 0 ? (
                  <ul className="space-y-1.5 text-xs text-stone-700">
                    {job.responsibilities.map((resp, rIdx) => (
                      <li key={rIdx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                        <span className="leading-relaxed">{resp}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-stone-500 italic">
                    Execute software feature implementations, API integrations, and collaborate in peer code reviews and sprint ceremonies.
                  </p>
                )}
              </div>

              {/* Extracted Required Competencies */}
              <div className="pt-2">
                <span className="text-[10px] font-bold text-rose-800/80 block mb-1.5 uppercase tracking-wide">
                  Required Competencies:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(job.extracted_skills || []).map((s, idx) => (
                    <span 
                      key={idx} 
                      className="px-2.5 py-0.5 rounded-full text-xs bg-white border border-rose-200 text-stone-700 font-medium"
                    >
                      {s.skill_name}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
