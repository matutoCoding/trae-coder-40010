import { cn } from '@/lib/utils';
import { getStatusText, getStatusColor } from '@/utils/format';

interface StatusBadgeProps {
  status: string;
  className?: string;
  showDot?: boolean;
}

export const StatusBadge = ({ status, className, showDot = true }: StatusBadgeProps) => {
  const colorClass = getStatusColor(status);
  const text = getStatusText(status);

  const getDotColor = () => {
    if (status === 'running' || status === 'completed' || status === 'pass' || status === 'repaired' || status === 'approved' || status === 'released' || status === 'available') {
      return 'bg-success-500';
    }
    if (status === 'error' || status === 'fail' || status === 'broken' || status === 'scrapped') {
      return 'bg-danger-500';
    }
    if (status === 'in_progress' || status === 'pending' || status === 'worn' || status === 'maintenance' || status === 'repairing' || status === 'verified') {
      return 'bg-warning-500';
    }
    return 'bg-industrial-300';
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium',
        colorClass,
        className
      )}
    >
      {showDot && (
        <span className={cn('w-1.5 h-1.5 rounded-full', getDotColor())}>
          {status === 'running' && <span className="block w-full h-full rounded-full pulse-ring" />}
        </span>
      )}
      {text}
    </span>
  );
};
