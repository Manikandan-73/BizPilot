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
      bg: 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />,
      accent: 'text-emerald-400',
    },
    warning: {
      bg: 'bg-amber-950/30 border-amber-500/30 text-amber-200',
      icon: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />,
      accent: 'text-amber-400',
    },
    info: {
      bg: 'bg-teal-950/30 border-teal-500/30 text-teal-200',
      icon: <Info className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />,
      accent: 'text-teal-400',
    },
    recommendation: {
      bg: 'bg-violet-950/30 border-violet-500/30 text-violet-200',
      icon: <Sparkles className="w-4 h-4 text-[#8B5CF6] shrink-0 mt-0.5" />,
      accent: 'text-[#A78BFA]',
    }
  };

  const current = styles[type];

  return (
    <div className={`p-4 rounded-xl border ${current.bg} relative overflow-hidden transition-all shadow-sm`}>
      <div className="flex items-start gap-3">
        {current.icon}
        <div className="flex-1 text-sm">
          <div className="flex items-center justify-between mb-1">
            <span className={`text-xs font-bold uppercase tracking-wider ${current.accent} flex items-center gap-1.5`}>
              <Sparkles className="w-3 h-3 inline" /> {title}
            </span>
          </div>
          <div className="text-[#F8FAFC] font-medium leading-relaxed text-xs sm:text-sm">
            {children}
          </div>
          {actionText && (
            <button
              onClick={onAction}
              className={`mt-2.5 inline-flex items-center gap-1 text-xs font-bold ${current.accent} hover:underline transition-all`}
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
