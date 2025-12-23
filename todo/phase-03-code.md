# 📄 Code & Templates — Phase 3 (Partie 1)

> Code source pour la Phase 3.
> **Utilisé par** : [phase-03-slice.md](phase-03-slice.md) et [phase-03-slice-suite.md](phase-03-slice-suite.md)
> **Suite** : [phase-03-code-suite.md](phase-03-code-suite.md)

---

## 1. Boutons Login Mock

```tsx
'use client';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

type Role = 'student' | 'teacher' | 'admin';

export function MockLoginButtons() {
  const router = useRouter();
  const loginAs = (role: Role) => {
    localStorage.setItem('mockRole', role);
    router.push(`/${role}`);
  };

  return (
    <div className="mt-6 pt-4 border-t">
      <p className="text-sm text-muted-foreground mb-3">Connexion rapide (dev)</p>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => loginAs('student')}>👨‍🎓 Élève</Button>
        <Button variant="outline" onClick={() => loginAs('teacher')}>👨‍🏫 Prof</Button>
        <Button variant="secondary" onClick={() => loginAs('admin')}>🔧 Admin</Button>
      </div>
    </div>
  );
}
```

---

## 2. Layout Page Login

```tsx
// src/app/(auth)/login/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="text-4xl mb-2">🎓</div>
          <CardTitle className="text-2xl">BlaizBot</CardTitle>
          <p className="text-muted-foreground">Connectez-vous pour continuer</p>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## 3. mockData.ts complet

```typescript
// src/data/mockData.ts
export const currentUser = {
  id: '1', name: 'Lucas Martin', email: 'lucas@example.com',
  role: 'student' as const, class: '3ème A',
};

export const courses = [
  { id: '1', title: 'Mathématiques', description: 'Algèbre, géométrie', progress: 75, teacher: 'M. Dupont' },
  { id: '2', title: 'Français', description: 'Littérature', progress: 60, teacher: 'Mme Bernard' },
  { id: '3', title: 'Histoire-Géo', description: 'Révolution à nos jours', progress: 40, teacher: 'M. Petit' },
];

export const studentProgress = {
  coursesCompleted: 2, totalCourses: 5, averageScore: 78, hoursSpent: 24,
};

export const chapters = [
  { id: '1', title: 'Introduction aux équations', completed: true },
  { id: '2', title: 'Équations du premier degré', completed: true },
  { id: '3', title: 'Systèmes d\'équations', completed: true },
  { id: '4', title: 'Fonctions linéaires', completed: false },
  { id: '5', title: 'Fonctions affines', completed: false },
];
```

---

## 4. WelcomeCard.tsx

```tsx
// src/components/dashboard/WelcomeCard.tsx
import { Card, CardContent } from '@/components/ui/card';

interface WelcomeCardProps { userName: string; }

export function WelcomeCard({ userName }: WelcomeCardProps) {
  const firstName = userName.split(' ')[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';

  return (
    <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
      <CardContent className="pt-6">
        <h1 className="text-2xl font-bold">{greeting}, {firstName} 👋</h1>
        <p className="text-blue-100 mt-1">Prêt à continuer vos révisions ?</p>
      </CardContent>
    </Card>
  );
}
```

---

## 5. StatsCards.tsx

```tsx
// src/components/dashboard/StatsCards.tsx
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Clock, Trophy, Target } from 'lucide-react';

interface StatsCardsProps {
  stats: { coursesCompleted: number; totalCourses: number; averageScore: number; hoursSpent: number; };
}

export function StatsCards({ stats }: StatsCardsProps) {
  const items = [
    { icon: BookOpen, label: 'Cours terminés', value: `${stats.coursesCompleted}/${stats.totalCourses}` },
    { icon: Trophy, label: 'Score moyen', value: `${stats.averageScore}%` },
    { icon: Clock, label: 'Heures', value: `${stats.hoursSpent}h` },
    { icon: Target, label: 'Objectif', value: '85%' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map((item) => (
        <Card key={item.label}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <item.icon className="h-4 w-4" />
              <span className="text-sm">{item.label}</span>
            </div>
            <p className="text-2xl font-bold mt-1">{item.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

---

## 6. RecentCourses.tsx

```tsx
// src/components/dashboard/RecentCourses.tsx
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChevronRight } from 'lucide-react';

interface Course { id: string; title: string; progress: number; teacher: string; }

export function RecentCourses({ courses }: { courses: Course[] }) {
  return (
    <Card>
      <CardHeader><CardTitle>Mes cours en cours</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {courses.map((course) => (
          <Link key={course.id} href={`/student/courses/${course.id}`}
            className="block p-3 rounded-lg border hover:bg-slate-50 transition-colors">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">{course.title}</h3>
                <p className="text-sm text-muted-foreground">{course.teacher}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Progress value={course.progress} className="flex-1" />
              <span className="text-sm">{course.progress}%</span>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
```

---

**Suite** → [phase-03-code-suite.md](phase-03-code-suite.md) (Sections 7-12)

---

*Dernière MAJ : 2025-01-13*
