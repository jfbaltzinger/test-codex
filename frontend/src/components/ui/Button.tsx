import React from 'react';
import clsx from 'clsx';
import { Slot } from '@radix-ui/react-slot';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

const baseClasses =
  'inline-flex items-center justify-center rounded-lg font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60';

const variantClasses: Record<Variant, string> = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary-500',
  secondary:
    'bg-white text-primary-600 ring-1 ring-inset ring-primary-200 hover:bg-primary-50 focus-visible:ring-primary-500',
  ghost: 'bg-transparent text-primary-600 hover:bg-primary-50 focus-visible:ring-primary-500',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: React.ReactNode;
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', icon, children, asChild = false, type, ...props }, ref) => {
    const content = (
      <>
        {icon && <span className="mr-2 flex h-5 w-5 items-center justify-center">{icon}</span>}
        {children}
      </>
    );

    if (asChild) {
      return (
        <Slot className={clsx(baseClasses, variantClasses[variant], sizeClasses[size], className)} {...props}>
          {content}
        </Slot>
      );
    }

    return (
      <button
        ref={ref}
        className={clsx(baseClasses, variantClasses[variant], sizeClasses[size], className)}
        type={type ?? 'button'}
        {...props}
      >
        {content}
      </button>
    );
  }
);

Button.displayName = 'Button';
