import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, GraduationCap, BookOpen } from 'lucide-react';

interface TeacherClassCardProps {
  classData: {
    id: string;
    name: string;
    level: string;
    studentsCount: number;
    subjects?: string[];
  };
}

export function TeacherClassCard({ classData }: TeacherClassCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-100 p-2">
            <GraduationCap className="h-5 w-5 text-blue-600" />
          </div>
          <div>
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
        
        {classData.subjects && classData.subjects.length > 0 && (
          <div className="flex items-start gap-2">
            <BookOpen className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="flex flex-wrap gap-1">
              {classData.subjects.map((subject) => (
                <Badge key={subject} variant="secondary" className="text-xs">
                  {subject}
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
