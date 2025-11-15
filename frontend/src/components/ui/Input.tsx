import React from 'react';
import clsx from 'clsx';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="flex flex-col space-y-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            'rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200',
            error && 'border-red-400 focus:ring-red-200',
            className
          )}
          {...props}
        />
        {(error || helperText) && (
          <p className={clsx('text-xs', error ? 'text-red-500' : 'text-slate-500')}>
            {error ?? helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
