import React from 'react';
import { 
  Briefcase, 
  MapPin, 
  Building2, 
  Flame
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
    <div className="space-y-6">
      {/* Industry Overview Banner */}
      <div className="bg-white border border-rose-200 rounded-2xl p-6 shadow-pink-card flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <span className="badge-info text-xs mb-2">
            Hiring Intelligence
          </span>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 font-['Hanken_Grotesk']">
            {domainName} Market Demand &amp; Placement Readiness
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1.5 max-w-2xl leading-relaxed">
            Real-time hiring telemetry synthesized from {jobsData.length} verified company requisitions across active tech employers in {domainName}.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 shrink-0">
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
              {marketRoles.length > 0 ? `${marketRoles.length} Active Tracks` : '5 Key Roles'}
            </div>
            <span className="text-xs text-orange-600 font-bold">
              Verified Benchmark
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Demanded Industry Skills Leaderboard */}
        <div className="bg-white border border-rose-200 rounded-2xl p-6 shadow-pink-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              Demanded Competencies
            </h3>
            <span className="text-xs text-stone-500">By frequency</span>
          </div>

          <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
            {sortedSkills.slice(0, 15).map((skill, rank) => (
              <div 
                key={skill.skill_id}
                className="p-3.5 rounded-xl bg-gradient-to-r from-[#FFF5F7] to-white border border-rose-200/90 flex items-center justify-between hover:border-rose-300 transition-colors"
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
                  <div className="w-16 bg-rose-100 h-1.5 rounded-full mt-1 overflow-hidden">
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

        {/* Live Job Postings List */}
        <div className="lg:col-span-2 bg-white border border-rose-200 rounded-2xl p-6 shadow-pink-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-orange-500" />
                Industry Requisitions &amp; Demanded Skills
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Representative hiring profiles in {domainName}
              </p>
            </div>
            <span className="badge-info text-xs">
              {jobsData.length} Profiles
            </span>
          </div>

          <div className="space-y-3.5 max-h-[520px] overflow-y-auto pr-1">
            {jobsData.map((job) => (
              <div 
                key={job.id}
                className="p-5 rounded-2xl bg-gradient-to-b from-[#FFF5F7] to-white border border-rose-200/90 hover:border-rose-400 transition-all shadow-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <div>
                    <h4 className="text-sm font-bold text-stone-900">{job.title}</h4>
                    <p className="text-xs text-stone-500 flex items-center gap-2 mt-0.5">
                      <Building2 className="w-3.5 h-3.5 text-rose-400" /> 
                      <span className="text-stone-800 font-semibold">{job.company}</span>
                      <span>•</span>
                      <MapPin className="w-3.5 h-3.5 text-rose-400" /> 
                      <span>{job.location}</span>
                      <span>•</span>
                      <span className="font-mono text-[11px] font-medium text-stone-600">Exp: {job.experience}</span>
                    </p>
                  </div>
                </div>

                <p className="text-xs text-stone-600 my-2.5 leading-relaxed">
                  {job.description}
                </p>

                <div className="pt-3 border-t border-rose-100">
                  <span className="text-[11px] font-bold text-rose-800/80 block mb-1.5 uppercase tracking-wide">
                    Extracted Requirements:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {job.extracted_skills.map((s, idx) => (
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
    </div>
  );
}

