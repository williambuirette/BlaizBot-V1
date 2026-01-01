'use client';

import { Card, CardContent } from '@/components/ui/card';
import { CoursesOverview, calculateGrade } from '@/types/course-stats';
import { BookOpen, Users, TrendingUp } from 'lucide-react';

interface CoursesStatsHeaderProps {
  overview: CoursesOverview;
  className?: string;
}

/**
 * Header avec 3 cartes de statistiques pour la page Cours
 * - Nombre total de cours
 * - Nombre total d'élèves
 * - Performance moyenne globale
 */
export function CoursesStatsHeader({ 
  overview, 
  className = '' 
}: CoursesStatsHeaderProps) {
  const { totalCourses, totalStudents, averagePerformance, coursesWithData } = overview;
  
  // Calculer la note globale
  const globalGrade = averagePerformance > 0 ? calculateGrade(averagePerformance) : null;
  
  return (
    <div className={`grid gap-4 md:grid-cols-3 ${className}`}>
      {/* Carte 1: Total Cours */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Cours
              </p>
              <p className="text-2xl font-bold">{totalCourses}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {coursesWithData} avec données
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Carte 2: Total Élèves */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Élèves Actifs
              </p>
              <p className="text-2xl font-bold">{totalStudents}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Année scolaire en cours
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Carte 3: Performance Moyenne */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Performance Moyenne
              </p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold">
                  {averagePerformance > 0 ? `${averagePerformance}%` : 'N/A'}
                </p>
                {globalGrade && (
                  <span 
                    className={`text-lg font-semibold ${getGradeColorTextClass(globalGrade)}`}
                  >
                    ({globalGrade})
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Élèves (60%) + IA (40%)
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

/**
 * Retourne la classe de couleur pour le texte selon la note
 */
function getGradeColorTextClass(grade: string): string {
  switch (grade) {
    case 'A+':
      return 'text-emerald-600';
    case 'A':
      return 'text-green-600';
    case 'B':
      return 'text-blue-600';
    case 'C':
      return 'text-yellow-600';
    case 'D':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
}

export default CoursesStatsHeader;
