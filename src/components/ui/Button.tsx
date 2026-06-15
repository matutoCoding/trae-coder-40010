import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium transition-colors duration-150 rounded-industrial focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants = {
      primary: 'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 border border-primary-500 focus:ring-primary-300',
      secondary: 'bg-white text-industrial-600 hover:bg-industrial-50 active:bg-industrial-100 border border-industrial-200 focus:ring-industrial-100',
      danger: 'bg-danger-500 text-white hover:bg-danger-600 active:bg-danger-700 border border-danger-500 focus:ring-danger-300',
      ghost: 'text-industrial-600 hover:bg-industrial-50 active:bg-industrial-100 border-transparent focus:ring-industrial-100',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-2.5 text-base',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
