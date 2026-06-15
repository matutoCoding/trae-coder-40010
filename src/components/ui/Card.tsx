import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  extra?: ReactNode;
}

export const Card = ({ children, className, title, extra }: CardProps) => {
  return (
    <div className={cn('card', className)}>
      {(title || extra) && (
        <div className="flex items-center justify-between px-5 py-3 border-b border-industrial-100">
          {title && <h3 className="text-base font-medium text-industrial-600">{title}</h3>}
          {extra && <div>{extra}</div>}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
};
