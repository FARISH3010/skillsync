import React, { useState } from 'react';
import { 
  Sparkles, 
  RotateCcw, 
  CheckCircle2, 
  PlusCircle, 
  ArrowRight, 
  Zap, 
  TrendingUp,
  Layers,
  Code2,
  Terminal,
  Server,
  Cloud,
  Check
} from 'lucide-react';
import CircularCoverageGauge from './CircularCoverageGauge';

export default function SimulatorView({ 
  dashboardData, 
  simulatedSkills, 
  onToggleSimulatedSkill, 
  onResetSimulator, 
  simulationResult,
  simulating 
}) {
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('ALL');

  const currentData = simulationResult || dashboardData;
  const baselineCoverage = dashboardData?.summary?.baseline_coverage_pct ?? dashboardData?.summary?.overall_coverage_pct ?? 0;
  const currentCoverage = currentData?.summary?.overall_coverage_pct ?? 0;
  const simulatedGain = currentData?.summary?.simulated_gain_pct ?? (currentCoverage - baselineCoverage).toFixed(1);

  // Available skills to simulate
  const skillsToSimulate = dashboardData?.skills || [];
  
  // Extract unique categories
  const categories = ['ALL', ...Array.from(new Set(skillsToSimulate.map(s => s.category)))];

  const filteredSkills = skillsToSimulate.filter(s => {
    if (activeCategoryFilter === 'ALL') return true;
    return s.category === activeCategoryFilter;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Hero Banner & Live Gauge */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl relative overflow-hidden border border-indigo-500/25 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-500/10 via-cyan-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Dynamic Curriculum Scenario Modeler
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight">
              Interactive What-If Curriculum Simulator
            </h2>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              Inject candidate electives and in-demand skills into your syllabus. Toggle competencies below to observe real-time recalculation of student market readiness and gap mitigation.
            </p>

            <div className="flex items-center gap-3 mt-5">
              <span className="text-xs text-slate-400 font-mono">
                Active Injections: <strong className="text-indigo-300 font-semibold">{simulatedSkills.length}</strong> skills
              </span>
              {simulatedSkills.length > 0 && (
                <button
                  onClick={onResetSimulator}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition border border-slate-700 flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset Simulation
                </button>
              )}
            </div>
          </div>

          {/* Right Live Predictor Gauge Card */}
          <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl flex items-center gap-6 shadow-2xl shrink-0">
            <CircularCoverageGauge 
              baselinePct={Number(baselineCoverage)} 
              currentPct={Number(currentCoverage)} 
              size={150} 
            />

            <div className="space-y-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono block">
                  Simulated Upgrade
                </span>
                <div className="text-2xl font-bold text-white font-display flex items-center gap-2">
                  <span>{currentCoverage}%</span>
                  {Number(simulatedGain) > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                      +{simulatedGain}%
                    </span>
                  )}
                </div>
              </div>

              <div className="text-xs text-slate-400 max-w-[180px]">
                {simulatedSkills.length === 0 ? (
                  <span>Click any skill chip below to preview projected coverage gain.</span>
                ) : (
                  <span className="text-emerald-300/90">
                    Mitigating critical market deficiencies in hiring feeds.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Simulator Workspace: Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Candidate Skill Injection Chips */}
        <div className="lg:col-span-2 glass-panel p-6 sm:p-7 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
                <Zap className="w-5 h-5 text-indigo-400" />
                Candidate Skill Injection Matrix
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Click chips to toggle injection into current semester syllabus
              </p>
            </div>

            {/* Category filter pills */}
            <div className="flex flex-wrap gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    activeCategoryFilter === cat 
                      ? 'bg-indigo-600 text-white shadow-sm' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Skill Chips Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
            {filteredSkills.map(skill => {
              const isSelected = simulatedSkills.includes(skill.skill_id);
              const isAlreadyCovered = skill.is_covered && !isSelected;

              return (
                <div
                  key={skill.skill_id}
                  onClick={() => onToggleSimulatedSkill(skill.skill_id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between skill-chip ${
                    isSelected 
                      ? 'skill-chip-active' 
                      : isAlreadyCovered
                      ? 'bg-slate-900/40 border-slate-800/80 text-slate-400 hover:border-slate-700'
                      : 'bg-slate-850/60 border-slate-700/60 hover:border-indigo-500/50 hover:bg-slate-800/80 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      isSelected 
                        ? 'bg-indigo-500 text-white' 
                        : isAlreadyCovered
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {isSelected ? (
                        <Check className="w-4 h-4 stroke-[3]" />
                      ) : isAlreadyCovered ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <PlusCircle className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold font-display text-white">{skill.name}</h4>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span>{skill.category}</span>
                        <span>•</span>
                        <span className="font-mono text-indigo-400">{skill.market_frequency_pct}% Demand</span>
                      </div>
                    </div>
                  </div>

                  <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase ${
                    isSelected 
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      : isAlreadyCovered
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {isSelected ? 'INJECTED' : isAlreadyCovered ? 'IN SYLLABUS' : '+ SIMULATE'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Live Impact Breakdown */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h4 className="text-base font-bold text-white font-display flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Real-Time Impact Breakdown
            </h4>

            {/* Dual horizontal comparison progress bars */}
            <div className="space-y-4 pt-2">
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                  <span>Current Baseline Syllabus</span>
                  <span className="font-mono font-bold text-slate-300">{baselineCoverage}%</span>
                </div>
                <div className="w-full bg-slate-850 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-800">
                  <div 
                    className="bg-indigo-500 h-full rounded-full transition-all duration-700" 
                    style={{ width: `${baselineCoverage}%` }} 
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                  <span className="text-emerald-400 font-semibold">Simulated Upgrade Syllabus</span>
                  <span className="font-mono font-bold text-emerald-400">{currentCoverage}%</span>
                </div>
                <div className="w-full bg-slate-850 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-800">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-700 shadow-sm shadow-emerald-500/50" 
                    style={{ width: `${currentCoverage}%` }} 
                  />
                </div>
              </div>
            </div>

            {/* Impact Metric Summary Cards */}
            <div className="grid grid-cols-2 gap-3 pt-3">
              <div className="bg-slate-850/80 p-3.5 rounded-2xl border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono block">Coverage Delta</span>
                <span className="text-xl font-extrabold text-emerald-400 font-mono">
                  +{simulatedGain}%
                </span>
              </div>
              <div className="bg-slate-850/80 p-3.5 rounded-2xl border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono block">Remaining Gaps</span>
                <span className="text-xl font-extrabold text-rose-400 font-mono">
                  {currentData?.summary?.critical_gaps_count ?? 0}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed pt-2">
              Injecting industry skills directly aligns institutional syllabus outcomes with real Indian and global hiring requisites.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
