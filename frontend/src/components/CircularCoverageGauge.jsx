import React from 'react';

/**
 * CircularCoverageGauge:
 * Dual-ring radial telemetry gauge inspired by Stitch SkillSync design
 * Gradient arc from #E11D48 (blush rose) to #EA580C (sunset orange)
 * on a #FCE7F3 soft petal pink track.
 */
export default function CircularCoverageGauge({
  baselinePct = 54.2,
  currentPct = 54.2,
  size = 130,
  strokeWidth = 9,
}) {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Offsets
  const baselineOffset = circumference - (Math.min(100, Math.max(0, baselinePct)) / 100) * circumference;
  const currentOffset = circumference - (Math.min(100, Math.max(0, currentPct)) / 100) * circumference;
  const isSimulated = currentPct > baselinePct;

  return (
    <div className="relative flex flex-col items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id="pinkOrangeGradGauge" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E11D48" />
            <stop offset="100%" stopColor="#EA580C" />
          </linearGradient>
        </defs>

        {/* Outer Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--gauge-track, #FCE7F3)"
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Target Benchmark ghost arc (68%) */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E2BFB4"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - 0.68)}
          strokeLinecap="round"
          fill="none"
          opacity={0.5}
        />

        {/* Active Arc (Gradient) */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#pinkOrangeGradGauge)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={currentOffset}
          strokeLinecap="round"
          fill="none"
          className="transition-all duration-700 ease-out"
        />
      </svg>

      {/* Central Metric */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
        <div className="flex items-baseline justify-center">
          <span className="text-2xl font-black text-stone-900 tracking-tight font-sans tabular-nums">
            {currentPct}
          </span>
          <span className="text-xs font-bold text-rose-600 ml-0.5">%</span>
        </div>
        <span className="text-[9px] font-bold uppercase tracking-wider text-rose-700/90 mt-0.5">
          {isSimulated ? `+${(currentPct - baselinePct).toFixed(1)}% Sim` : 'Alignment'}
        </span>
      </div>
    </div>
  );
}

