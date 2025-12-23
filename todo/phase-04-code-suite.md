# 📄 Code & Templates — Phase 4 (Partie 2)

> Scripts de seed et commandes pour la Phase 4 (Database).
> **Précédent** : [phase-04-code.md](phase-04-code.md)
> **Utilisé par** : [phase-04-database-suite.md](phase-04-database-suite.md)

---

## 6. prisma/seed.ts (structure)

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Nettoyer (ordre inverse des dépendances)
  await prisma.message.deleteMany();
  await prisma.chapter.deleteMany();
  await prisma.course.deleteMany();
  await prisma.teacherAssignment.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.class.deleteMany();
  await prisma.user.deleteMany();

  // 2. Créer les users
  // ... (voir section 7)

  // 3. Créer classes, subjects, courses
  // ... (voir section 8)

  console.log('✅ Seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
```

---

## 7. Seed Users complet

```typescript
// Dans prisma/seed.ts - Section Users

const hashedPassword = await bcrypt.hash('password123', 10);

// Admin
const admin = await prisma.user.create({
  data: {
    email: 'admin@blaizbot.fr',
    password: hashedPassword,
    name: 'Administrateur',
    role: 'ADMIN',
  },
});
console.log('✅ Admin created');

// Teachers
const teacher1 = await prisma.user.create({
  data: {
    email: 'dupont@blaizbot.fr',
    password: hashedPassword,
    name: 'Jean Dupont',
    role: 'TEACHER',
  },
});

const teacher2 = await prisma.user.create({
  data: {
    email: 'bernard@blaizbot.fr',
    password: hashedPassword,
    name: 'Marie Bernard',
    role: 'TEACHER',
  },
});
console.log('✅ Teachers created');

// Students
const studentNames = [
  { email: 'lucas@example.com', name: 'Lucas Martin' },
  { email: 'emma@example.com', name: 'Emma Dubois' },
  { email: 'hugo@example.com', name: 'Hugo Moreau' },
  { email: 'lea@example.com', name: 'Léa Petit' },
  { email: 'tom@example.com', name: 'Tom Richard' },
];

const students = await Promise.all(
  studentNames.map((s) =>
    prisma.user.create({
      data: { ...s, password: hashedPassword, role: 'STUDENT' },
    })
  )
);
console.log('✅ Students created');
```

---

## 8. Seed Classes & Courses

```typescript
// Dans prisma/seed.ts - Section Classes, Subjects, Courses

// Classes
const classes = await Promise.all([
  prisma.class.create({ data: { name: '3ème A', level: '3ème', year: 2025 } }),
  prisma.class.create({ data: { name: '3ème B', level: '3ème', year: 2025 } }),
  prisma.class.create({ data: { name: '4ème A', level: '4ème', year: 2025 } }),
]);
console.log('✅ Classes created');

// Subjects
const subjects = await Promise.all([
  prisma.subject.create({ data: { name: 'Mathématiques', color: '#3b82f6' } }),
  prisma.subject.create({ data: { name: 'Français', color: '#8b5cf6' } }),
  prisma.subject.create({ data: { name: 'Histoire-Géo', color: '#f59e0b' } }),
  prisma.subject.create({ data: { name: 'SVT', color: '#10b981' } }),
]);
console.log('✅ Subjects created');

// Courses (2 par prof)
await prisma.course.createMany({
  data: [
    { title: 'Algèbre niveau 3ème', description: 'Équations et fonctions', subjectId: subjects[0].id, teacherId: teacher1.id },
    { title: 'Géométrie dans l\'espace', description: 'Volumes et solides', subjectId: subjects[0].id, teacherId: teacher1.id },
    { title: 'Le roman au XIXe', description: 'Balzac, Hugo, Zola', subjectId: subjects[1].id, teacherId: teacher2.id },
    { title: 'Grammaire avancée', description: 'Syntaxe et conjugaison', subjectId: subjects[1].id, teacherId: teacher2.id },
    { title: 'La Révolution française', description: '1789-1799', subjectId: subjects[2].id, teacherId: teacher1.id },
    { title: 'La cellule vivante', description: 'Biologie cellulaire', subjectId: subjects[3].id, teacherId: teacher2.id },
  ],
});
console.log('✅ Courses created');

// Enrollments (élèves → classes)
await prisma.enrollment.createMany({
  data: [
    { userId: students[0].id, classId: classes[0].id },
    { userId: students[1].id, classId: classes[0].id },
    { userId: students[2].id, classId: classes[1].id },
    { userId: students[3].id, classId: classes[1].id },
    { userId: students[4].id, classId: classes[2].id },
  ],
});
console.log('✅ Enrollments created');
```

---

## 9. package.json (section prisma)

```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

**📝 Note** : Ajouter cette section dans le `package.json` existant, pas remplacer tout le fichier.

---

## 10. Commandes utiles

| Commande | Description |
| :--- | :--- |
| `npx prisma validate` | Valider le schéma |
| `npx prisma migrate dev --name nom` | Créer une migration |
| `npx prisma migrate deploy` | Appliquer les migrations (prod) |
| `npx prisma generate` | Générer le client |
| `npx prisma db seed` | Exécuter le seed |
| `npx prisma studio` | Ouvrir Prisma Studio |
| `npx prisma migrate reset` | Reset complet ⚠️ |

---

## 11. Tests de validation

```bash
# Test 1: Schéma valide
npx prisma validate
# Attendu: ✅ The Prisma schema is valid.

# Test 2: Migration sans erreur
npx prisma migrate dev --name initial
# Attendu: ✅ Your database is now in sync with your schema.

# Test 3: Seed fonctionne
npx prisma db seed
# Attendu: ✅ Seed completed!

# Test 4: Prisma Studio ouvre
npx prisma studio
# Attendu: Browser ouvre sur localhost:5555
```

---

## 12. Troubleshooting

| Erreur | Cause | Solution |
| :--- | :--- | :--- |
| `P1001: Can't reach database` | URL incorrecte | Vérifier `DATABASE_URL` dans `.env.local` |
| `Unique constraint failed` | Seed re-exécuté | Ajouter `deleteMany()` au début du seed |
| `Cannot find module 'tsx'` | tsx pas installé | `npm i -D tsx` |
| `bcryptjs not found` | Dépendance manquante | `npm i bcryptjs` + `npm i -D @types/bcryptjs` |

---

*Dernière MAJ : 2025-01-13*
