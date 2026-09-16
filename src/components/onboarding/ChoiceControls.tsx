import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../lib/cn';
import { useLanguage } from '../../i18n/LanguageContext';

interface YesNoToggleProps {
  value: boolean | null;
  onChange: (value: boolean) => void;
  error?: string;
}

export const YesNoToggle: React.FC<YesNoToggleProps> = ({ value, onChange, error }) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-1.5">
      <div className="inline-flex p-1 bg-[#0D1118] border border-[#222936] rounded-xl">
        {(['Yes', 'No'] as const).map((label) => {
          const boolValue = label === 'Yes';
          const isActive = value === boolValue;
          const translatedLabel = label === 'Yes' ? t('common.yes', 'Yes') : t('common.no', 'No');

          return (
            <button
              key={label}
              type="button"
              onClick={() => onChange(boolValue)}
              className={cn(
                'px-5 py-2 rounded-lg text-xs font-bold transition-all',
                isActive 
                  ? 'bg-violet-600 text-white shadow-sm' 
                  : 'text-[#A7B0C0] hover:text-[#F8FAFC]'
              )}
            >
              {translatedLabel}
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
                ? 'bg-violet-950/40 border-violet-500 text-violet-300 shadow-sm'
                : 'bg-[#121722] border-[#222936] text-[#A7B0C0] hover:border-[#303848] hover:text-[#F8FAFC]'
            )}
          >
            {isActive && <Check className="w-3.5 h-3.5 text-violet-400" />}
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
                ? 'bg-violet-600 border-violet-600 text-white shadow-sm'
                : 'bg-[#121722] border-[#222936] text-[#A7B0C0] hover:border-[#303848] hover:text-[#F8FAFC]'
            )}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}