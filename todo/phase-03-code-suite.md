# 📄 Code & Templates — Phase 3 (Partie 2)

> Suite du code pour la Phase 3.
> **Partie 1** : [phase-03-code.md](phase-03-code.md) (Sections 1-6)

---

## 7. Page détail cours

```tsx
// src/app/(dashboard)/student/courses/[id]/page.tsx
import { courses, chapters } from '@/data/mockData';
import { CourseHeader } from '@/components/courses/CourseHeader';
import { ChaptersList } from '@/components/courses/ChaptersList';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface PageProps { params: { id: string }; }

export default function CoursePage({ params }: PageProps) {
  const course = courses.find(c => c.id === params.id);
  if (!course) notFound();

  return (
    <div className="space-y-6">
      <Link href="/student/courses">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux cours
        </Button>
      </Link>
      <CourseHeader course={course} />
      <ChaptersList chapters={chapters} />
    </div>
  );
}
```

---

## 8. CourseHeader.tsx

```tsx
// src/components/courses/CourseHeader.tsx
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { User } from 'lucide-react';

interface CourseHeaderProps {
  course: { title: string; description: string; progress: number; teacher: string; };
}

export function CourseHeader({ course }: CourseHeaderProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">{course.title}</h1>
            <p className="text-muted-foreground mt-1">{course.description}</p>
            <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{course.teacher}</span>
            </div>
          </div>
          <Badge variant={course.progress === 100 ? 'default' : 'secondary'}>
            {course.progress}% complété
          </Badge>
        </div>
        <Progress value={course.progress} className="mt-4" />
      </CardContent>
    </Card>
  );
}
```

---

## 9. ChaptersList.tsx

```tsx
// src/components/courses/ChaptersList.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Circle, PlayCircle } from 'lucide-react';

interface Chapter { id: string; title: string; completed: boolean; }

export function ChaptersList({ chapters }: { chapters: Chapter[] }) {
  return (
    <Card>
      <CardHeader><CardTitle>Chapitres</CardTitle></CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {chapters.map((chapter, index) => (
            <li key={chapter.id}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer">
              {chapter.completed ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <Circle className="h-5 w-5 text-slate-300" />
              )}
              <span className={chapter.completed ? 'text-muted-foreground' : ''}>
                {index + 1}. {chapter.title}
              </span>
              {!chapter.completed && index === chapters.filter(c => c.completed).length && (
                <PlayCircle className="h-5 w-5 text-blue-500 ml-auto" />
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
```

---

## 10. LoadingSpinner.tsx

```tsx
// src/components/ui/LoadingSpinner.tsx
export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );
}
```

---

## 11. loading.tsx

```tsx
// src/app/(dashboard)/student/courses/[id]/loading.tsx
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function Loading() {
  return <LoadingSpinner />;
}
```

---

## 12. LoginForm complet

```tsx
// src/components/auth/LoginForm.tsx
'use client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

type Role = 'student' | 'teacher' | 'admin';

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();

  const loginAs = (role: Role) => {
    localStorage.setItem('mockRole', role);
    toast({
      title: 'Connexion réussie',
      description: `Bienvenue en tant que ${role === 'student' ? 'élève' : role === 'teacher' ? 'professeur' : 'admin'}`,
    });
    router.push(`/${role}`);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="vous@exemple.com" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Mot de passe</Label>
        <Input id="password" type="password" placeholder="••••••••" />
      </div>
      <Button className="w-full" disabled>Se connecter</Button>

      <div className="mt-6 pt-4 border-t">
        <p className="text-sm text-muted-foreground mb-3 text-center">Connexion rapide (dev)</p>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => loginAs('student')}>👨‍🎓 Élève</Button>
          <Button variant="outline" className="flex-1" onClick={() => loginAs('teacher')}>👨‍🏫 Prof</Button>
          <Button variant="secondary" className="flex-1" onClick={() => loginAs('admin')}>🔧 Admin</Button>
        </div>
      </div>
    </div>
  );
}
```

---

## 13. Assembler le dashboard étudiant

```tsx
// src/app/(dashboard)/student/page.tsx
import { currentUser, courses, studentProgress } from '@/data/mockData';
import { WelcomeCard } from '@/components/dashboard/WelcomeCard';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { RecentCourses } from '@/components/dashboard/RecentCourses';

export default function StudentDashboard() {
  return (
    <div className="space-y-6">
      <WelcomeCard userName={currentUser.name} />
      <StatsCards stats={studentProgress} />
      <RecentCourses courses={courses} />
    </div>
  );
}
```

---

*Dernière MAJ : 2025-01-13*
