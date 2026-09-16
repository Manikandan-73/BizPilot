import React from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '../../lib/cn';

interface FormFieldProps {
  label: string;
  required?: boolean;
  helperText?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
  htmlFor?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  required,
  helperText,
  error,
  children,
  className,
  htmlFor,
}) => {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={htmlFor} className="text-xs font-semibold text-[#A7B0C0] flex items-center gap-1">
        {label}
        {required && <span className="text-rose-400">*</span>}
      </label>
      {children}
      {error ? (
        <p className="text-[11px] text-rose-400 flex items-center gap-1">
          <AlertCircle className="w-3 h-3 shrink-0" />
          {error}
        </p>
      ) : helperText ? (
        <p className="text-[11px] text-[#707A8C]">{helperText}</p>
      ) : null}
    </div>
  );
};

/** Shared input classes so every control in the wizard looks consistent. */
export const fieldInputClasses = (hasError?: boolean) =>
  cn(
    'w-full px-3.5 py-2.5 bg-[#0D1118] border rounded-xl text-[#F8FAFC] text-sm placeholder:text-[#707A8C]',
    'focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all',
    hasError ? 'border-rose-500' : 'border-[#222936] focus:border-violet-500'
  );