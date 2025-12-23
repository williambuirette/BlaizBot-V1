'use client';

import { useSyncExternalStore } from 'react';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, User, Settings, LogOut } from 'lucide-react';

// Fix hydration mismatch avec Radix UI
const emptySubscribe = () => () => {};
const useIsClient = () =>
  useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

// -----------------------------------------------------
// COMPOSANT HEADER
// -----------------------------------------------------

export function Header() {
  const isClient = useIsClient();

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

      {/* Zone droite - Avatar + Dropdown */}
      {isClient ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Avatar>
                <AvatarImage src="/avatar.png" alt="Avatar" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              Mon profil
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              Paramètres
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer text-red-500">
              <LogOut className="mr-2 h-4 w-4" />
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Avatar>
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      )}
    </header>
  );
}
