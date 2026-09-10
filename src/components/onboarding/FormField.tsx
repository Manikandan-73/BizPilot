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
      <label htmlFor={htmlFor} className="text-xs font-semibold text-slate-300 flex items-center gap-1">
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
        <p className="text-[11px] text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
};

/** Shared input classes so every control in the wizard looks consistent. */
export const fieldInputClasses = (hasError?: boolean) =>
  cn(
    'w-full px-3.5 py-2.5 bg-slate-950 border rounded-xl text-white text-sm placeholder:text-slate-600',
    'focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all',
    hasError ? 'border-rose-500/60' : 'border-slate-800 focus:border-purple-500'
  );