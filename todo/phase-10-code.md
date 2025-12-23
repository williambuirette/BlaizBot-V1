# 📄 Code & Templates — Phase 10

> Code source pour la Phase 10 (Stabilisation & Démo).
> **Utilisé par** : [phase-10-demo.md](phase-10-demo.md)

---

## 1. FallbackError Component

```tsx
// src/components/ui/FallbackError.tsx
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface FallbackErrorProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function FallbackError({
  title = 'Oups !',
  message = 'Une erreur s\'est produite',
  onRetry,
}: FallbackErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <p className="text-muted-foreground mb-4 max-w-md">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Réessayer
        </Button>
      )}
    </div>
  );
}
```

---

## 2. AIUnavailable Component

```tsx
// src/components/features/ai/AIUnavailable.tsx
import { Bot, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface AIUnavailableProps {
  onRetry?: () => void;
}

export function AIUnavailable({ onRetry }: AIUnavailableProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <Bot className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
        <h3 className="text-lg font-semibold mb-2">Assistant temporairement indisponible</h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-sm">
          Le service IA est momentanément surchargé. 
          Réessayez dans quelques instants ou consultez vos fiches de révision.
        </p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Réessayer
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
```

---

## 3. Maintenance Page

```tsx
// src/app/maintenance/page.tsx
import { Wrench } from 'lucide-react';

export default function MaintenancePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <Wrench className="h-16 w-16 text-primary mb-6" />
      <h1 className="text-2xl font-bold mb-2">Maintenance en cours</h1>
      <p className="text-muted-foreground text-center max-w-md mb-8">
        BlaizBot est temporairement indisponible pour maintenance.
        Nous serons de retour très bientôt !
      </p>
      <p className="text-sm text-muted-foreground">
        Durée estimée : quelques minutes
      </p>
    </div>
  );
}
```

---

## 4. Seed Demo Script

```typescript
// prisma/seed-demo.ts
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding demo data...');

  // Clear existing data
  await prisma.message.deleteMany();
  await prisma.progress.deleteMany();
  await prisma.chapter.deleteMany();
  await prisma.course.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.teacherAssignment.deleteMany();
  await prisma.class.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.user.deleteMany();

  const hashPassword = (pwd: string) => bcrypt.hashSync(pwd, 10);

  // Create subjects
  const subjects = await Promise.all([
    prisma.subject.create({ data: { name: 'Mathématiques', color: '#3B82F6' } }),
    prisma.subject.create({ data: { name: 'Français', color: '#EF4444' } }),
    prisma.subject.create({ data: { name: 'Histoire-Géo', color: '#F59E0B' } }),
    prisma.subject.create({ data: { name: 'SVT', color: '#10B981' } }),
  ]);

  // Create admin
  await prisma.user.create({
    data: {
      email: 'demo@blaizbot.edu',
      password: hashPassword('demo123'),
      firstName: 'Admin',
      lastName: 'Démo',
      role: Role.ADMIN,
    },
  });

  // Create teachers
  const teacher1 = await prisma.user.create({
    data: {
      email: 'm.dupont@blaizbot.edu',
      password: hashPassword('prof123'),
      firstName: 'Marc',
      lastName: 'DUPONT',
      role: Role.TEACHER,
    },
  });

  const teacher2 = await prisma.user.create({
    data: {
      email: 'mme.bernard@blaizbot.edu',
      password: hashPassword('prof123'),
      firstName: 'Sophie',
      lastName: 'BERNARD',
      role: Role.TEACHER,
    },
  });

  // Create students
  const students = await Promise.all([
    prisma.user.create({
      data: { email: 'lucas.martin@blaizbot.edu', password: hashPassword('eleve123'), firstName: 'Lucas', lastName: 'MARTIN', role: Role.STUDENT },
    }),
    prisma.user.create({
      data: { email: 'emma.durand@blaizbot.edu', password: hashPassword('eleve123'), firstName: 'Emma', lastName: 'DURAND', role: Role.STUDENT },
    }),
    prisma.user.create({
      data: { email: 'noah.petit@blaizbot.edu', password: hashPassword('eleve123'), firstName: 'Noah', lastName: 'PETIT', role: Role.STUDENT },
    }),
  ]);

  // Create classes
  const class3A = await prisma.class.create({ data: { name: '3ème A', level: '3ème' } });
  const class3B = await prisma.class.create({ data: { name: '3ème B', level: '3ème' } });

  // Assign teachers
  await prisma.teacherAssignment.createMany({
    data: [
      { userId: teacher1.id, classId: class3A.id, subjectId: subjects[0].id },
      { userId: teacher1.id, classId: class3B.id, subjectId: subjects[3].id },
      { userId: teacher2.id, classId: class3A.id, subjectId: subjects[1].id },
      { userId: teacher2.id, classId: class3B.id, subjectId: subjects[2].id },
    ],
  });

  // Enroll students
  await prisma.enrollment.createMany({
    data: [
      { userId: students[0].id, classId: class3A.id },
      { userId: students[1].id, classId: class3A.id },
      { userId: students[2].id, classId: class3B.id },
    ],
  });

  // Create courses
  await prisma.course.create({
    data: {
      title: 'Les Fractions',
      content: `# Les Fractions\n\n## Définition\nUne fraction représente une partie d'un tout.\n\n## Notation\n- Numérateur (en haut)\n- Dénominateur (en bas)\n\n## Exemples\n- 1/2 = une moitié\n- 3/4 = trois quarts`,
      teacherId: teacher1.id,
      subjectId: subjects[0].id,
    },
  });

  console.log('✅ Demo seed completed!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
```

---

## 5. KNOWN_ISSUES.md Template

```markdown
# Known Issues

> Bugs identifiés non corrigés pour la V1

## 🟡 Mineurs (cosmétiques)

### ISSUE-001 : Tooltip tronqué sur mobile
- **Page** : Dashboard élève
- **Description** : Le tooltip des KPI dépasse l'écran sur petit mobile
- **Impact** : Cosmétique uniquement
- **Contournement** : Utiliser en mode paysage

### ISSUE-002 : Flash au changement de thème
- **Page** : Toutes
- **Description** : Léger flash blanc lors du toggle dark/light
- **Impact** : UX mineure
- **Contournement** : Aucun nécessaire

## 🟠 Majeurs (à corriger V1.1)

### ISSUE-003 : Performance liste > 100 items
- **Page** : Admin > Users
- **Description** : Lenteur si plus de 100 utilisateurs
- **Impact** : Performance dégradée
- **Solution prévue** : Pagination côté serveur

---

*Dernière mise à jour : 2025-12-XX*
```

---

## 6. DEMO_SCRIPT.md Template

```markdown
# 🎬 Script de Démonstration BlaizBot

## ⏱️ Durée totale : 5 minutes

---

## 🔧 Préparation (avant la démo)

- [ ] Terminal : `npm run dev` lancé ✅
- [ ] BDD : `npm run seed:demo` exécuté ✅
- [ ] Navigateur : http://localhost:3000 ouvert ✅
- [ ] DevTools : Fermé (propre) ✅

---

## 🎭 Partie 1 : Admin (1 min)

| Étape | Action | Dire |
|-------|--------|------|
| 1 | Aller sur /login | "Commençons par le rôle admin" |
| 2 | Login demo@blaizbot.edu / demo123 | "Je me connecte..." |
| 3 | Montrer dashboard | "Voici le tableau de bord avec les KPIs" |
| 4 | Cliquer Users | "Je peux gérer les utilisateurs" |
| 5 | Montrer liste | "Liste des profs et élèves" |
| 6 | Logout | "Passons au professeur" |

---

## 🎭 Partie 2 : Professeur (1 min 30s)

| Étape | Action | Dire |
|-------|--------|------|
| 1 | Login m.dupont@blaizbot.edu / prof123 | "Je suis M. Dupont, prof de maths" |
| 2 | Dashboard | "Mes classes et statistiques" |
| 3 | Cliquer Mes Cours | "Je crée et gère mes cours" |
| 4 | Ouvrir "Les Fractions" | "Voici un cours existant" |
| 5 | Montrer contenu | "Contenu en markdown enrichi" |
| 6 | Logout | "Voyons maintenant côté élève" |

---

## 🎭 Partie 3 : Élève + IA (2 min)

| Étape | Action | Dire |
|-------|--------|------|
| 1 | Login lucas.martin@blaizbot.edu / eleve123 | "Lucas, élève de 3ème A" |
| 2 | Dashboard | "Ma progression globale" |
| 3 | Cliquer Mes Cours | "Les cours de ma classe" |
| 4 | Ouvrir "Les Fractions" | "Je consulte le cours" |
| 5 | Cliquer Assistant IA | "J'ai une question !" |
| 6 | Taper : "Comment additionner 1/2 + 1/4 ?" | "Je demande à Blaiz'bot" |
| 7 | Attendre streaming | "Il m'explique pas à pas..." |
| 8 | Montrer mode toggle | "Mode indices ou explications" |
| 9 | Cliquer Générer Quiz | "Je teste mes connaissances" |
| 10 | Jouer 2 questions | "Quiz interactif avec correction" |

---

## 🆘 Plan B

| Problème | Solution |
|----------|----------|
| IA ne répond pas | "Le service est temporairement chargé" → montrer fiches |
| Erreur 500 | Refresh + "Petit souci réseau" |
| Login échoue | Relancer seed : `npm run seed:demo` |
```

---

> **Retour** : [phase-10-demo.md](phase-10-demo.md)

---

*Dernière MAJ : 2025-12-22*
