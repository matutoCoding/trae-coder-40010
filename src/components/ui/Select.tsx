import { SelectHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  options: { value: string; label: string }[];
  onChange?: (value: string) => void;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, options, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange?.(e.target.value);
    };
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label className="text-sm font-medium text-industrial-600">{label}</label>
        )}
        <select
          ref={ref}
          className={cn(
            'w-full px-3 py-2 text-sm bg-white border border-industrial-200 rounded-industrial',
            'focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500',
            'appearance-none bg-no-repeat bg-right pr-8',
            className
          )}
          style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundSize: '1.5em 1.5em', backgroundPosition: 'right 0.5rem center' }}
          onChange={handleChange}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  }
);
