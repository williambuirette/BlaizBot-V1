import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface Course {
  id: string;
  title: string;
  teacher: string;
  progress: number;
}

interface RecentCoursesProps {
  courses: Course[];
}

export function RecentCourses({ courses }: RecentCoursesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mes cours récents</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {courses.map((course) => (
          <div key={course.id} className="space-y-2">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">{course.title}</p>
                <p className="text-sm text-muted-foreground">{course.teacher}</p>
              </div>
              <span className="text-sm font-medium">{course.progress}%</span>
            </div>
            <Progress value={course.progress} className="h-2" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
