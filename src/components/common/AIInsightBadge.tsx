import React from 'react';
import { Sparkles, ArrowUpRight, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

interface AIInsightBadgeProps {
  type?: 'positive' | 'warning' | 'info' | 'recommendation';
  title?: string;
  children: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
}

export const AIInsightBadge: React.FC<AIInsightBadgeProps> = ({
  type = 'info',
  title = 'AI Copilot Insight',
  children,
  actionText,
  onAction
}) => {
  const styles = {
    positive: {
      bg: 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />,
      accent: 'text-emerald-400',
    },
    warning: {
      bg: 'bg-amber-950/40 border-amber-500/30 text-amber-300',
      icon: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />,
      accent: 'text-amber-400',
    },
    info: {
      bg: 'bg-sky-950/40 border-sky-500/30 text-sky-300',
      icon: <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />,
      accent: 'text-sky-400',
    },
    recommendation: {
      bg: 'bg-purple-950/40 border-purple-500/30 text-purple-200',
      icon: <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />,
      accent: 'text-purple-400',
    }
  };

  const current = styles[type];

  return (
    <div className={`p-4 rounded-xl border ${current.bg} backdrop-blur-md relative overflow-hidden transition-all hover:border-opacity-60`}>
      <div className="flex items-start gap-3">
        {current.icon}
        <div className="flex-1 text-sm">
          <div className="flex items-center justify-between mb-1">
            <span className={`text-xs font-semibold uppercase tracking-wider ${current.accent} flex items-center gap-1.5`}>
              <Sparkles className="w-3 h-3 inline" /> {title}
            </span>
          </div>
          <div className="text-slate-200 font-normal leading-relaxed text-xs sm:text-sm">
            {children}
          </div>
          {actionText && (
            <button
              onClick={onAction}
              className={`mt-2.5 inline-flex items-center gap-1 text-xs font-semibold ${current.accent} hover:underline transition-all`}
            >
              {actionText}
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
