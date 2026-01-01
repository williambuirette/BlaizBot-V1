/**
 * Panel Performance des Cours (Top/Flop)
 * Phase 7-sexies
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, Users } from 'lucide-react';
import type { CoursePerformance } from '@/types/dashboard-filters';
import { cn } from '@/lib/utils';

interface CoursesPerformancePanelProps {
  top: CoursePerformance[];
  bottom: CoursePerformance[];
  isLoading?: boolean;
}

function CourseItem({
  course,
  variant,
}: {
  course: CoursePerformance;
  variant: 'top' | 'bottom';
}) {
  const isGood = variant === 'top';
  const scoreColor = course.averageScore >= 70 
    ? 'text-green-600' 
    : course.averageScore >= 50 
      ? 'text-orange-500' 
      : 'text-red-600';

  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {isGood ? (
            <TrendingUp className="h-4 w-4 text-green-600 shrink-0" />
          ) : (
            <TrendingDown className="h-4 w-4 text-orange-500 shrink-0" />
          )}
          <span className="font-medium truncate">{course.courseTitle}</span>
        </div>
        {course.weakPoint && (
          <p className="text-xs text-muted-foreground ml-6 mt-0.5">
            {course.weakPoint}
          </p>
        )}
      </div>
      <div className="flex items-center gap-3 ml-2">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Users className="h-3 w-3" />
          <span>{course.studentCount}</span>
        </div>
        <Badge
          variant="secondary"
          className={cn('font-bold', scoreColor)}
        >
          {course.averageScore}%
        </Badge>
      </div>
    </div>
  );
}

export function CoursesPerformancePanel({
  top,
  bottom,
  isLoading,
}: CoursesPerformancePanelProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const hasData = top.length > 0 || bottom.length > 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          📈 Performance des Cours
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasData ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Aucune donnée de performance disponible
          </p>
        ) : (
          <>
            {/* Top Cours */}
            {top.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-green-700 mb-2 flex items-center gap-1">
                  ✅ Mieux compris
                </h4>
                <div className="space-y-0">
                  {top.map((course) => (
                    <CourseItem key={course.courseId} course={course} variant="top" />
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Cours */}
            {bottom.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-orange-600 mb-2 flex items-center gap-1">
                  ⚠️ À améliorer
                </h4>
                <div className="space-y-0">
                  {bottom.map((course) => (
                    <CourseItem key={course.courseId} course={course} variant="bottom" />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
