'use client';

import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, CheckCircle, Clock, TrendingUp } from 'lucide-react';

export interface StudentCoursesOverview {
  totalCourses: number;
  completedCourses: number;
  inProgressCourses: number;
  averageProgress: number;
}

interface StudentCoursesStatsHeaderProps {
  overview: StudentCoursesOverview;
  className?: string;
}

/**
 * Header avec 4 cartes de statistiques pour la page Cours Élève
 * - Nombre total de cours
 * - Cours terminés
 * - Cours en cours
 * - Progression moyenne
 */
export function StudentCoursesStatsHeader({ 
  overview, 
  className = '' 
}: StudentCoursesStatsHeaderProps) {
  const { totalCourses, completedCourses, inProgressCourses, averageProgress } = overview;
  
  return (
    <div className={`grid gap-4 md:grid-cols-4 ${className}`}>
      {/* Carte 1: Total Cours */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Mes Cours
              </p>
              <p className="text-2xl font-bold">{totalCourses}</p>
              <p className="text-xs text-muted-foreground mt-1">
                cours disponibles
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Carte 2: Cours Terminés */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Terminés
              </p>
              <p className="text-2xl font-bold text-green-600">{completedCourses}</p>
              <p className="text-xs text-muted-foreground mt-1">
                cours complétés
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Carte 3: En Cours */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                En Cours
              </p>
              <p className="text-2xl font-bold text-orange-600">{inProgressCourses}</p>
              <p className="text-xs text-muted-foreground mt-1">
                cours en progression
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Carte 4: Progression Moyenne */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Progression
              </p>
              <p className="text-2xl font-bold">{averageProgress}%</p>
              <p className="text-xs text-muted-foreground mt-1">
                moyenne globale
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
