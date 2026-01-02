-- Migration étape 1: Ajouter les nouvelles valeurs à l'enum
ALTER TYPE "StudentCardType" ADD VALUE IF NOT EXISTS 'LESSON';
ALTER TYPE "StudentCardType" ADD VALUE IF NOT EXISTS 'VIDEO';
