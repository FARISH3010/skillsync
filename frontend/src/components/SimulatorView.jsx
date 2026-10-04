import React, { useState } from 'react';
import { 
  RotateCcw, 
  CheckCircle2, 
  PlusCircle, 
  Zap, 
  TrendingUp,
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
    <div className="space-y-6">
      {/* Top Banner & Live Gauge */}
      <div className="bg-white border border-rose-200 rounded-2xl p-6 shadow-pink-card flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-800 text-xs font-bold mb-2">
            <Zap className="w-3.5 h-3.5 text-orange-500" />
            What-If Scenario Modeler
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 font-['Hanken_Grotesk']">
            Curriculum Simulation &amp; Skill Injection
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1.5 leading-relaxed">
            Select candidate electives and high-demand competencies below to observe instant recalculated student readiness and workforce alignment.
          </p>

          <div className="flex items-center gap-3 mt-4">
            <span className="text-xs text-stone-500 font-medium">
              Active Injections: <strong className="text-rose-600 font-bold font-mono">{simulatedSkills.length}</strong> skills
            </span>
            {simulatedSkills.length > 0 && (
              <button
                onClick={onResetSimulator}
                className="btn-secondary text-xs h-7 px-3 py-0 border-rose-200 text-stone-700 hover:bg-rose-50"
              >
                <RotateCcw className="w-3 h-3 text-rose-500" />
                Reset Simulation
              </button>
            )}
          </div>
        </div>

        {/* Right Live Predictor Gauge Card */}
        <div className="bg-gradient-to-br from-white to-[#FFF5F7] border border-rose-200 p-5 rounded-2xl flex items-center gap-5 shrink-0 shadow-xs">
          <CircularCoverageGauge 
            baselinePct={Number(baselineCoverage)} 
            currentPct={Number(currentCoverage)} 
            size={120} 
          />

          <div className="space-y-2">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-rose-800 block">
                Simulated Coverage
              </span>
              <div className="text-2xl font-black text-stone-900 flex items-center gap-2">
                <span>{currentCoverage}%</span>
                {Number(simulatedGain) > 0 && (
                  <span className="text-xs font-bold text-rose-600 font-mono bg-rose-100 px-2 py-0.5 rounded-full border border-rose-200">
                    +{simulatedGain}%
                  </span>
                )}
              </div>
            </div>

            <div className="text-xs text-stone-500 max-w-[170px] leading-tight">
              {simulatedSkills.length === 0 ? (
                <span>Click any candidate skill below to preview projected coverage.</span>
              ) : (
                <span className="text-rose-600 font-medium">
                  Simulated elective additions active.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Simulator Workspace: Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Candidate Skill Injection Chips */}
        <div className="lg:col-span-2 bg-white border border-rose-200 rounded-2xl p-6 shadow-pink-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <Zap className="w-4 h-4 text-orange-500" />
                Candidate Skill Injection Matrix
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Toggle competencies to inject into simulated syllabus evaluation
              </p>
            </div>

            {/* Category filter pills */}
            <div className="flex flex-wrap gap-1 bg-[#FFF5F7] p-1 rounded-full border border-rose-200">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                    activeCategoryFilter === cat 
                      ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-xs' 
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Skill Chips Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1">
            {filteredSkills.map(skill => {
              const isSelected = simulatedSkills.includes(skill.skill_id);
              const isAlreadyCovered = skill.is_covered && !isSelected;

              return (
                <div
                  key={skill.skill_id}
                  onClick={() => onToggleSimulatedSkill(skill.skill_id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected 
                      ? 'bg-[#FFF0F3] border-rose-400 text-rose-900 shadow-sm' 
                      : isAlreadyCovered
                      ? 'bg-[#FFF5F7]/70 border-rose-200 text-stone-500 opacity-75'
                      : 'bg-white border-rose-200/90 hover:border-rose-400 text-stone-800 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      isSelected 
                        ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-xs' 
                        : isAlreadyCovered
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-rose-50 text-rose-500'
                    }`}>
                      {isSelected ? (
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      ) : isAlreadyCovered ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <PlusCircle className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-stone-900">{skill.name}</h4>
                      <div className="flex items-center gap-1.5 text-[11px] text-stone-500 mt-0.5">
                        <span>{skill.category}</span>
                        <span>•</span>
                        <span className="font-mono text-rose-700 font-semibold">{skill.market_frequency_pct}% Demand</span>
                      </div>
                    </div>
                  </div>

                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold uppercase ${
                    isSelected 
                      ? 'bg-rose-200 text-rose-900' 
                      : isAlreadyCovered
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-[#FFF5F7] text-stone-600 border border-rose-200'
                  }`}>
                    {isSelected ? 'INJECTED' : isAlreadyCovered ? 'COVERED' : '+ SIMULATE'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Live Impact Breakdown */}
        <div className="space-y-4">
          <div className="bg-white border border-rose-200 rounded-2xl p-6 shadow-pink-card space-y-4">
            <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2 font-['Hanken_Grotesk']">
              <TrendingUp className="w-4 h-4 text-rose-600" />
              Simulation Impact Summary
            </h4>

            {/* Progress comparison */}
            <div className="space-y-3.5 pt-1">
              <div>
                <div className="flex justify-between text-xs text-stone-600 mb-1 font-medium">
                  <span>Current Baseline Syllabus</span>
                  <span className="font-mono font-bold text-stone-900">{baselineCoverage}%</span>
                </div>
                <div className="w-full bg-rose-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-stone-400 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${baselineCoverage}%` }} 
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-rose-700 mb-1 font-bold">
                  <span>Simulated Curriculum Outcome</span>
                  <span className="font-mono font-black">{currentCoverage}%</span>
                </div>
                <div className="w-full bg-rose-100 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-rose-500 to-orange-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${currentCoverage}%` }} 
                  />
                </div>
              </div>
            </div>

            {/* Impact Metric Cards */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-[#FFF5F7] p-3.5 rounded-xl border border-rose-200">
                <span className="text-[10px] uppercase font-bold text-rose-800 block">Coverage Gain</span>
                <span className="text-lg font-black text-rose-600 font-mono">
                  +{simulatedGain}%
                </span>
              </div>
              <div className="bg-[#FFF5F7] p-3.5 rounded-xl border border-rose-200">
                <span className="text-[10px] uppercase font-bold text-stone-600 block">Unmet Gaps</span>
                <span className="text-lg font-black text-stone-900 font-mono">
                  {currentData?.summary?.critical_gaps_count ?? 0}
                </span>
              </div>
            </div>

            <p className="text-xs text-stone-500 leading-relaxed pt-1">
              Adding verified modules directly mitigates curriculum gap counts and increases student placement success metrics.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

