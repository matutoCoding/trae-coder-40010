import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: number;
  trendLabel?: string;
  className?: string;
  valueClassName?: string;
  unit?: string;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'industrial';
}

const colorClasses: Record<string, string> = {
  primary: 'bg-primary-50 text-primary-500',
  success: 'bg-success-50 text-success-500',
  warning: 'bg-warning-50 text-warning-500',
  danger: 'bg-danger-50 text-danger-500',
  industrial: 'bg-industrial-50 text-industrial-500',
};

export const StatCard = ({ title, value, icon, trend, trendLabel, className, valueClassName, unit, color }: StatCardProps) => {
  return (
    <div className={cn('card p-5', className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-industrial-400 mb-1">{title}</p>
          <p className={cn('text-2xl font-bold data-number', valueClassName)}>
            {value}
            {unit && <span className="text-sm font-normal text-industrial-400 ml-1">{unit}</span>}
          </p>
          {trend !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              {trend >= 0 ? (
                <TrendingUp className="w-4 h-4 text-success-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-danger-500" />
              )}
              <span className={cn('text-xs', trend >= 0 ? 'text-success-500' : 'text-danger-500')}>
                {trend >= 0 ? '+' : ''}{trend}%
              </span>
              {trendLabel && <span className="text-xs text-industrial-400 ml-1">{trendLabel}</span>}
            </div>
          )}
        </div>
        <div className={cn('p-3 rounded-industrial', colorClasses[color || 'primary'])}>
          {icon}
        </div>
      </div>
    </div>
  );
};
