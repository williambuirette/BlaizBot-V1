import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Users, GraduationCap, BookOpen, Bot } from 'lucide-react';
import type { ClassWithStats } from '@/types/class-filters';

interface TeacherClassCardProps {
  classData: ClassWithStats;
  selected?: boolean;
  onToggleSelect?: () => void;
}

export function TeacherClassCard({ classData, selected = false, onToggleSelect }: TeacherClassCardProps) {
  const alertColors = {
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    danger: 'bg-red-100 text-red-700',
    'no-data': 'bg-gray-100 text-gray-700',
  };

  return (
    <Card className={`hover:shadow-md transition-shadow ${selected ? 'ring-2 ring-blue-500' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          {onToggleSelect && (
            <Checkbox
              checked={selected}
              onCheckedChange={onToggleSelect}
              className="mt-1"
            />
          )}
          <div className="rounded-lg bg-blue-100 p-2">
            <GraduationCap className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg">{classData.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{classData.level}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{classData.studentsCount} élève{classData.studentsCount > 1 ? 's' : ''}</span>
        </div>

        {/* Moyenne */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Moyenne</span>
          <Badge className={alertColors[classData.stats.alertLevel]}>
            {classData.stats.averageGrade !== null
              ? `${classData.stats.averageGrade.toFixed(1)}/6`
              : '—'}
          </Badge>
        </div>

        {/* Moyenne IA */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Bot className="h-3.5 w-3.5" />
            Score IA
          </span>
          <Badge className="bg-purple-100 text-purple-700">
            {classData.stats.aiAverageScore !== null
              ? `${classData.stats.aiAverageScore.toFixed(0)}%`
              : '—'}
          </Badge>
        </div>
        
        {classData.subjects && classData.subjects.length > 0 && (
          <div className="flex items-start gap-2">
            <BookOpen className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="flex flex-wrap gap-1">
              {classData.subjects.map((subject) => (
                <Badge key={subject.id} variant="secondary" className="text-xs">
                  {subject.name}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        <Button asChild variant="outline" className="w-full">
          <Link href={`/teacher/classes/${classData.id}`}>
            Voir la classe
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
