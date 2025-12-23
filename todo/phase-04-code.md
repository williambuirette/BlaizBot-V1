# 📄 Code & Templates — Phase 4 (Partie 1)

> Code source pour la Phase 4 (Database).
> **Utilisé par** : [phase-04-database.md](phase-04-database.md) et [phase-04-database-suite.md](phase-04-database-suite.md)
> **Suite** : [phase-04-code-suite.md](phase-04-code-suite.md)

---

## 1. Template .env.local

```bash
# === VERCEL POSTGRES ===
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT_REF].VERCEL.co:5432/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT_REF].VERCEL.co:5432/postgres"

# === VERCEL PUBLIC (côté client) ===
NEXT_PUBLIC_VERCEL_URL="https://[PROJECT_REF].VERCEL.co"
NEXT_PUBLIC_VERCEL_ANON_KEY="eyJ..."

# === À AJOUTER PLUS TARD (Auth) ===
# NEXTAUTH_SECRET="généré-avec-openssl-rand-base64-32"
# NEXTAUTH_URL="http://localhost:3000"
```

**⚠️ REMPLACER** :
- `[YOUR-PASSWORD]` par le mot de passe de la DB VERCEL
- `[PROJECT_REF]` par l'ID du projet (visible dans l'URL VERCEL)

---

## 2. schema.prisma (datasource)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

---

## 3. src/lib/prisma.ts

```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

---

## 4. Modèle User

```prisma
enum Role {
  ADMIN
  TEACHER
  STUDENT
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String
  role      Role     @default(STUDENT)
  avatar    String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  enrollments       Enrollment[]
  teacherAssignments TeacherAssignment[]
  sentMessages      Message[] @relation("SentMessages")
  receivedMessages  Message[] @relation("ReceivedMessages")
  courses           Course[]  @relation("TeacherCourses")
}
```

---

## 5. Schéma Prisma complet

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

enum Role {
  ADMIN
  TEACHER
  STUDENT
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String
  role      Role     @default(STUDENT)
  avatar    String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  enrollments        Enrollment[]
  teacherAssignments TeacherAssignment[]
  sentMessages       Message[] @relation("SentMessages")
  receivedMessages   Message[] @relation("ReceivedMessages")
  courses            Course[]  @relation("TeacherCourses")
}

model Class {
  id    String @id @default(cuid())
  name  String
  level String
  year  Int

  enrollments        Enrollment[]
  teacherAssignments TeacherAssignment[]
}

model Subject {
  id    String @id @default(cuid())
  name  String @unique
  color String @default("#3b82f6")

  courses            Course[]
  teacherAssignments TeacherAssignment[]
}

model Course {
  id          String   @id @default(cuid())
  title       String
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  subjectId String
  subject   Subject @relation(fields: [subjectId], references: [id])
  teacherId String
  teacher   User    @relation("TeacherCourses", fields: [teacherId], references: [id])

  chapters Chapter[]
}

model Chapter {
  id      String @id @default(cuid())
  title   String
  content String @db.Text
  order   Int

  courseId String
  course   Course @relation(fields: [courseId], references: [id], onDelete: Cascade)
}

model Enrollment {
  id String @id @default(cuid())

  userId  String
  user    User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  classId String
  class   Class  @relation(fields: [classId], references: [id], onDelete: Cascade)

  @@unique([userId, classId])
}

model TeacherAssignment {
  id String @id @default(cuid())

  userId    String
  user      User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  classId   String
  class     Class   @relation(fields: [classId], references: [id], onDelete: Cascade)
  subjectId String
  subject   Subject @relation(fields: [subjectId], references: [id], onDelete: Cascade)

  @@unique([userId, classId, subjectId])
}

model Message {
  id        String   @id @default(cuid())
  content   String   @db.Text
  read      Boolean  @default(false)
  createdAt DateTime @default(now())

  senderId   String
  sender     User   @relation("SentMessages", fields: [senderId], references: [id])
  receiverId String
  receiver   User   @relation("ReceivedMessages", fields: [receiverId], references: [id])
}
```

---

> **Suite** : [phase-04-code-suite.md](phase-04-code-suite.md) (Seed scripts, package.json, commandes)

---

*Dernière MAJ : 2025-01-13*
