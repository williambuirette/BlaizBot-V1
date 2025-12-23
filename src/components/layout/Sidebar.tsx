'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Role } from '@/types';
import {
  Home,
  Users,
  School,
  BookMarked,
  Settings,
  BookOpen,
  MessageSquare,
  GraduationCap,
  Brain,
  Calendar,
} from 'lucide-react';

// -----------------------------------------------------
// TYPES
// -----------------------------------------------------

interface SidebarProps {
  role: Role;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

// -----------------------------------------------------
// NAVIGATION PAR RÔLE
// -----------------------------------------------------

const adminNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: <Home size={20} /> },
  { label: 'Utilisateurs', href: '/admin/users', icon: <Users size={20} /> },
  { label: 'Classes', href: '/admin/classes', icon: <School size={20} /> },
  { label: 'Matières', href: '/admin/subjects', icon: <BookMarked size={20} /> },
  { label: 'Paramètres', href: '/admin/settings', icon: <Settings size={20} /> },
];

const teacherNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/teacher', icon: <Home size={20} /> },
  { label: 'Mes classes', href: '/teacher/classes', icon: <School size={20} /> },
  { label: 'Mes élèves', href: '/teacher/students', icon: <Users size={20} /> },
  { label: 'Mes cours', href: '/teacher/courses', icon: <BookOpen size={20} /> },
  { label: 'Messages', href: '/teacher/messages', icon: <MessageSquare size={20} /> },
];

const studentNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/student', icon: <Home size={20} /> },
  { label: 'Mes cours', href: '/student/courses', icon: <BookOpen size={20} /> },
  { label: 'Révisions', href: '/student/revisions', icon: <GraduationCap size={20} /> },
  { label: 'Assistant IA', href: '/student/assistant', icon: <Brain size={20} /> },
  { label: 'Agenda', href: '/student/calendar', icon: <Calendar size={20} /> },
  { label: 'Messages', href: '/student/messages', icon: <MessageSquare size={20} /> },
];

const navItemsByRole: Record<Role, NavItem[]> = {
  ADMIN: adminNavItems,
  TEACHER: teacherNavItems,
  STUDENT: studentNavItems,
};

// -----------------------------------------------------
// COMPOSANT SIDEBAR
// -----------------------------------------------------

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const navItems = navItemsByRole[role];

  return (
    <aside className="w-64 h-screen bg-slate-900 text-white fixed left-0 top-0 flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-slate-700">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🤖</span>
          <span className="text-xl font-bold">BlaizBot</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map(item => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2 rounded-lg transition-colors',
                    'hover:bg-slate-800',
                    isActive && 'bg-slate-800 text-blue-400'
                  )}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700">
        <p className="text-xs text-slate-400">BlaizBot v1.0</p>
      </div>
    </aside>
  );
}
