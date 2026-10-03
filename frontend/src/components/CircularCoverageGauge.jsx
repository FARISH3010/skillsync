import React from 'react';

/**
 * CircularCoverageGauge:
 * Dual-ring animated circular SVG gauge showing baseline vs simulated coverage
 * aligned with the Stitch "Curriculum Matrix" design specification.
 */
export default function CircularCoverageGauge({
  baselinePct = 54.2,
  currentPct = 54.2,
  size = 190,
  strokeWidth = 14,
}) {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Calculate offsets for clockwise ring
  const baselineOffset = circumference - (Math.min(100, Math.max(0, baselinePct)) / 100) * circumference;
  const currentOffset = circumference - (Math.min(100, Math.max(0, currentPct)) / 100) * circumference;
  const isSimulated = currentPct > baselinePct;

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id="baselineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#818CF8" />
          </linearGradient>
          <linearGradient id="simulatedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#34D399" />
          </linearGradient>
          <filter id="gaugeGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--gauge-track, rgba(255, 255, 255, 0.06))"
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Simulated Gain Arc (if active) */}
        {isSimulated && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#simulatedGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={currentOffset}
            strokeLinecap="round"
            fill="none"
            filter="url(#gaugeGlow)"
            className="transition-all duration-1000 ease-out"
          />
        )}

        {/* Primary Baseline Ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={isSimulated ? "rgba(99, 102, 241, 0.55)" : "url(#baselineGradient)"}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={baselineOffset}
          strokeLinecap="round"
          fill="none"
          filter={!isSimulated ? "url(#gaugeGlow)" : undefined}
          className="transition-all duration-1000 ease-out"
        />
      </svg>

      {/* Central Metric Telemetry Display */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 font-mono">
          Coverage
        </span>
        <div className="flex items-baseline justify-center">
          <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight">
            {currentPct}
          </span>
          <span className="text-sm font-bold text-indigo-400 font-mono ml-0.5">%</span>
        </div>
        {isSimulated ? (
          <span className="text-[11px] font-semibold text-emerald-400 font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mt-1">
            +{(currentPct - baselinePct).toFixed(1)}% Sim
          </span>
        ) : (
          <span className="text-[10px] text-slate-400 font-mono mt-1">
            Baseline Target
          </span>
        )}
      </div>
    </div>
  );
}
