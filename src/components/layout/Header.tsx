'use client';

import { useSyncExternalStore } from 'react';
import { signOut } from 'next-auth/react';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, User, Settings, LogOut } from 'lucide-react';
import { NotificationBell } from '@/components/features/shared/NotificationBell';

// -----------------------------------------------------
// TYPES
// -----------------------------------------------------

interface HeaderProps {
  user?: {
    name?: string | null;
    email?: string | null;
  };
}

// Fix hydration mismatch avec Radix UI
const emptySubscribe = () => () => {};
const useIsClient = () =>
  useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

// Générer les initiales à partir du nom
const getInitials = (name?: string | null): string => {
  if (!name) return 'U';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

// -----------------------------------------------------
// COMPOSANT HEADER
// -----------------------------------------------------

export function Header({ user }: HeaderProps) {
  const isClient = useIsClient();
  const initials = getInitials(user?.name);

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6">
      {/* Zone gauche - Titre de page */}
      <div className="flex items-center">
        <h1 className="text-xl font-semibold">Dashboard</h1>
      </div>

      {/* Zone centre - Barre de recherche */}
      <div className="relative max-w-md flex-1 mx-8">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Rechercher..." className="pl-10" />
      </div>

      {/* Zone droite - Notifications + Avatar + Dropdown */}
      <div className="flex items-center gap-4">
        <NotificationBell />
        
        {isClient ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Avatar>
                <AvatarFallback className="bg-slate-700 text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium hidden sm:block">
                {user?.name || 'Utilisateur'}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user?.name || 'Utilisateur'}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              Mon profil
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              Paramètres
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="cursor-pointer text-red-500"
              onClick={() => signOut({ callbackUrl: '/login' })}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Avatar>
          <AvatarFallback className="bg-slate-700 text-white">
            {initials}
          </AvatarFallback>
        </Avatar>
      )}
      </div>
    </header>
  );
}
