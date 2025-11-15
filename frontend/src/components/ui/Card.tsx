import clsx from 'clsx';
import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingClasses: Record<Required<CardProps>['padding'], string> = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, padding = 'md', ...props }, ref) => (
    <div
      ref={ref}
      className={clsx('rounded-xl border border-slate-200 bg-white shadow-sm', paddingClasses[padding], className)}
      {...props}
    >
      {children}
    </div>
  )
);

Card.displayName = 'Card';
