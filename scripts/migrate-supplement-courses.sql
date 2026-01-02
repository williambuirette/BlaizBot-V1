-- Migration: courseId -> relation many-to-many StudentSupplementCourse
-- Étape 1: Créer la table de liaison
-- Étape 2: Migrer les données existantes (si courseId non null)
-- Étape 3: Supprimer la colonne courseId

-- Note: Cette migration sera appliquée automatiquement par Prisma
-- Ce script est pour référence et migration manuelle si nécessaire

-- Migrer les suppléments existants qui ont un courseId
INSERT INTO "StudentSupplementCourse" (id, "supplementId", "courseId", "createdAt")
SELECT 
  gen_random_uuid()::text,
  id,
  "courseId",
  NOW()
FROM "StudentSupplement"
WHERE "courseId" IS NOT NULL;
