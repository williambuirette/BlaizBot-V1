// Cellule KPI pour afficher les scores

'use client';

import { Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICellProps {
  label: string;
  value: string;
  className?: string;
  valueClassName?: string;
  onClick?: () => void;
  editable?: boolean;
}

export function KPICell({
  label,
  value,
  className,
  valueClassName,
  onClick,
  editable,
}: KPICellProps) {
  return (
    <div 
      className={cn(
        'text-center p-1.5 bg-muted/50 rounded',
        editable && 'cursor-pointer hover:bg-muted transition-colors',
        className
      )}
      onClick={(e) => {
        if (onClick) {
          e.stopPropagation();
          onClick();
        }
      }}
    >
      <div className={cn('font-semibold text-xs', valueClassName)}>
        {value}
        {editable && <Pencil className="inline-block ml-1 h-2.5 w-2.5 text-muted-foreground" />}
      </div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </div>
  );
}
