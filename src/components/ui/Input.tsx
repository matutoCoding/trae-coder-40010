import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

type InputBaseProps = {
  label?: string;
  error?: string;
  multiline?: boolean;
  rows?: number;
  onChange?: (value: string) => void;
};

type InputProps = InputBaseProps & (InputHTMLAttributes<HTMLInputElement> | TextareaHTMLAttributes<HTMLTextAreaElement>);

export const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
  ({ className, label, error, multiline, rows, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      onChange?.(e.target.value);
    };

    const baseClasses = cn(
      'w-full px-3 py-2 text-sm bg-white border rounded-industrial',
      'focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500',
      'placeholder:text-industrial-300',
      error ? 'border-danger-500' : 'border-industrial-200',
      className
    );

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label className="text-sm font-medium text-industrial-600">{label}</label>
        )}
        {multiline ? (
          <textarea
            ref={ref as React.Ref<HTMLTextAreaElement>}
            className={baseClasses}
            rows={rows || 4}
            onChange={handleChange}
            {...(props as TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input
            ref={ref as React.Ref<HTMLInputElement>}
            className={baseClasses}
            onChange={handleChange}
            {...(props as InputHTMLAttributes<HTMLInputElement>)}
          />
        )}
        {error && <span className="text-xs text-danger-500">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
