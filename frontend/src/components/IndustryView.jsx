import React from 'react';
import { 
  Briefcase, 
  TrendingUp, 
  MapPin, 
  Building2, 
  Layers, 
  CheckCircle2, 
  Flame,
  ArrowUpRight
} from 'lucide-react';

export default function IndustryView({ jobsData, dashboardData }) {
  if (!dashboardData) return null;

  // Compute top demanded skills across job postings
  const sortedSkills = [...(dashboardData.skills || [])].sort(
    (a, b) => b.market_frequency_pct - a.market_frequency_pct
  );

  const domainName = dashboardData?.summary?.domain_name || "Industry";
  const marketRoles = dashboardData?.market_roles || [];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Industry Overview Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 relative overflow-hidden shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-3">
              <TrendingUp className="w-3.5 h-3.5" />
              Live Hiring Demand & Placement Intelligence
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
              {domainName} Market Demand & Placement Readiness
            </h2>
            <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
              Real-time analysis synthesized from {jobsData.length} verified hiring profiles across active firms and modern employers in {domainName}.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 shrink-0">
            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
                Top Demanded
              </span>
              <div className="text-base sm:text-lg font-bold text-white font-display mt-1 truncate max-w-[140px]" title={sortedSkills[0]?.name}>
                {sortedSkills[0]?.name || 'Domain Competency'}
              </div>
              <span className="text-xs text-indigo-400 font-mono">
                {sortedSkills[0]?.market_frequency_pct || 85}% Frequency
              </span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
                Target Roles
              </span>
              <div className="text-base sm:text-lg font-bold text-white font-display mt-1">
                {marketRoles.length > 0 ? `${marketRoles.length} Active Tracks` : '5 Key Roles'}
              </div>
              <span className="text-xs text-emerald-400 font-mono">
                Verified Benchmark
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Demanded Industry Skills Leaderboard */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-400" />
              Top Demanded Competencies
            </h3>
            <span className="text-xs text-slate-400 font-medium">Ranked by hiring demand</span>
          </div>

          <div className="space-y-3.5 max-h-[600px] overflow-y-auto pr-1">
            {sortedSkills.slice(0, 15).map((skill, rank) => (
              <div 
                key={skill.skill_id}
                className="p-3.5 rounded-2xl bg-slate-850/60 border border-slate-700/50 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold font-mono ${
                    rank < 3 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {rank + 1}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-200">{skill.name}</h4>
                    <span className="text-[11px] text-slate-400">{skill.category}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-extrabold text-indigo-400 font-mono">
                    {skill.market_frequency_pct}%
                  </span>
                  <div className="w-16 bg-slate-800 h-1.5 rounded-full mt-1 overflow-hidden">
                    <div 
                      className="bg-indigo-500 h-full rounded-full" 
                      style={{ width: `${skill.market_frequency_pct}%` }} 
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Job Postings List */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-indigo-400" />
                Active Job Profiles & Demanded Skills
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Representative industry hiring requisitions in {domainName}
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-400 bg-slate-800 px-3 py-1 rounded-lg">
              {jobsData.length} Profiles
            </span>
          </div>

          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
            {jobsData.map((job) => (
              <div 
                key={job.id}
                className="p-5 rounded-2xl bg-slate-850/60 border border-slate-700/60 hover:border-indigo-500/40 transition"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div>
                    <h4 className="text-base font-bold text-white font-display">{job.title}</h4>
                    <p className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" /> 
                      <span className="text-slate-300 font-medium">{job.company}</span>
                      <span>•</span>
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> 
                      <span>{job.location}</span>
                      <span>•</span>
                      <span className="text-slate-400 font-mono text-[11px]">Exp: {job.experience}</span>
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 my-3 leading-relaxed">
                  {job.description}
                </p>

                <div className="pt-3 border-t border-slate-800/80">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 block mb-2">
                    NLP Extracted Skill Requirements:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {job.extracted_skills.map((s, idx) => (
                      <span 
                        key={idx}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 border border-emerald-500/25 text-emerald-300"
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
    </div>
  );
}
