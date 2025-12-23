'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

// -----------------------------------------------------
// TYPES
// -----------------------------------------------------

interface SidebarItemProps {
  href: string;
  label: string;
  icon: LucideIcon;
  isActive?: boolean;
}

// -----------------------------------------------------
// COMPOSANT
// -----------------------------------------------------

export function SidebarItem({ href, label, icon: Icon, isActive = false }: SidebarItemProps) {
  return (
    <li>
      <Link
        href={href}
        className={cn(
          'flex items-center gap-3 px-4 py-2 rounded-lg transition-colors',
          isActive
            ? 'bg-slate-800 text-white'
            : 'text-slate-400 hover:text-white hover:bg-slate-800'
        )}
      >
        <Icon size={20} />
        <span>{label}</span>
      </Link>
    </li>
  );
}
