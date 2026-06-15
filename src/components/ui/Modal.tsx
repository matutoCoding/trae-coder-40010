import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: number | string;
}

export const Modal = ({ open, onClose, title, children, footer, width = 600 }: ModalProps) => {
  const widthClass = typeof width === 'number' ? `w-[${width}px]` : width;
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className={cn('relative bg-white rounded-industrial shadow-industrial-lg', widthClass)}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-industrial-100">
          <h3 className="text-base font-medium text-industrial-600">{title}</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="p-5 max-h-[70vh] overflow-auto scrollbar-thin">{children}</div>
        {footer && <div className="flex justify-end gap-3 px-5 py-3 border-t border-industrial-100">{footer}</div>}
      </div>
    </div>
  );
};
