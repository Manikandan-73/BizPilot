import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../lib/cn';

interface YesNoToggleProps {
  value: boolean | null;
  onChange: (value: boolean) => void;
  error?: string;
}

export const YesNoToggle: React.FC<YesNoToggleProps> = ({ value, onChange, error }) => {
  return (
    <div className="space-y-1.5">
      <div className="inline-flex p-1 bg-slate-950 border border-slate-800 rounded-xl">
        {(['Yes', 'No'] as const).map((label) => {
          const boolValue = label === 'Yes';
          const isActive = value === boolValue;
          return (
            <button
              key={label}
              type="button"
              onClick={() => onChange(boolValue)}
              className={cn(
                'px-5 py-2 rounded-lg text-xs font-bold transition-all',
                isActive ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30' : 'text-slate-400 hover:text-white'
              )}
            >
              {label}
            </button>
          );
        })}
      </div>
      {error && <p className="text-[11px] text-rose-400">{error}</p>}
    </div>
  );
};

interface ChipMultiSelectProps<T extends string> {
  options: readonly T[];
  selected: T[];
  onToggle: (option: T) => void;
}

export function ChipMultiSelect<T extends string>({ options, selected, onToggle }: ChipMultiSelectProps<T>) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isActive = selected.includes(option);
        return (
          <button
            key={option}
            type="button"
            onClick={() => onToggle(option)}
            className={cn(
              'flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all',
              isActive
                ? 'bg-purple-600/20 border-purple-500 text-purple-200'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            )}
          >
            {isActive && <Check className="w-3.5 h-3.5 text-purple-400" />}
            {option}
          </button>
        );
      })}
    </div>
  );
}

interface ChipSingleSelectProps<T extends string> {
  options: readonly T[];
  selected: T | null;
  onSelect: (option: T) => void;
}

export function ChipSingleSelect<T extends string>({ options, selected, onSelect }: ChipSingleSelectProps<T>) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isActive = selected === option;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onSelect(option)}
            className={cn(
              'px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all',
              isActive
                ? 'bg-purple-600 border-purple-500 text-white shadow-md shadow-purple-600/20'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            )}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}