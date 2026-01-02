-- Migration étape 2: Mettre à jour les données
-- SUMMARY -> LESSON
-- FLASHCARD -> VIDEO
UPDATE "StudentCard" SET "cardType" = 'LESSON' WHERE "cardType" = 'SUMMARY';
UPDATE "StudentCard" SET "cardType" = 'VIDEO' WHERE "cardType" = 'FLASHCARD';
