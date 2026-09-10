import React from 'react';

interface ScoreGaugeProps {
  score: number;
  maxScore?: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  showGrade?: boolean;
  colorScheme?: 'purple' | 'blue' | 'emerald' | 'amber';
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  score,
  maxScore = 100,
  size = 180,
  strokeWidth = 14,
  label = 'Score',
  sublabel = 'out of 100',
  showGrade = true,
  colorScheme = 'purple'
}) => {
  const percentage = Math.min(Math.max((score / maxScore) * 100, 0), 100);
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  // Arc angle: 260 degrees arc for a speedo-like look
  const strokeDashoffset = circumference - (percentage / 100) * (circumference * 0.75);

  const getGradientId = () => `gauge-grad-${colorScheme}-${score}`;

  const getGrade = (val: number) => {
    if (val >= 80) return { text: 'Tier A • Prime', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
    if (val >= 70) return { text: 'Tier B+ • Healthy', color: 'text-sky-400 bg-sky-500/10 border-sky-500/30' };
    if (val >= 55) return { text: 'Tier B • Moderate', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
    return { text: 'Tier C • High Risk', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' };
  };

  const grade = getGrade(score);

  return (
    <div className="relative flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-135"
        >
          <defs>
            <linearGradient id={getGradientId()} x1="0%" y1="0%" x2="100%" y2="100%">
              {colorScheme === 'purple' && (
                <>
                  <stop offset="0%" stopColor="#6C63FF" />
                  <stop offset="60%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#38BDF8" />
                </>
              )}
              {colorScheme === 'emerald' && (
                <>
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#34D399" />
                </>
              )}
              {colorScheme === 'blue' && (
                <>
                  <stop offset="0%" stopColor="#38BDF8" />
                  <stop offset="100%" stopColor="#6366F1" />
                </>
              )}
              {colorScheme === 'amber' && (
                <>
                  <stop offset="0%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#EF4444" />
                </>
              )}
            </linearGradient>
            <filter id="glow-gauge" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1E293B"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
            strokeLinecap="round"
          />

          {/* Active progress bar */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={`url(#${getGradientId()})`}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            filter="url(#glow-gauge)"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Inner Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-extrabold text-white tracking-tight flex items-baseline">
            {score}
            <span className="text-xs text-slate-400 font-normal ml-0.5">/{maxScore}</span>
          </span>
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider mt-0.5">
            {label}
          </span>
          <span className="text-[10px] text-slate-400">
            {sublabel}
          </span>
        </div>
      </div>

      {showGrade && (
        <div className={`mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium border ${grade.color}`}>
          {grade.text}
        </div>
      )}
    </div>
  );
};
