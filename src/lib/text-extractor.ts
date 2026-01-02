/**
 * Utilitaire d'extraction de texte pour les fichiers uploadés
 * Permet à l'IA d'accéder au contenu des documents (RAG)
 */

import mammoth from 'mammoth';
import { readFile } from 'fs/promises';
import { join } from 'path';

// Types de fichiers supportés pour l'extraction
const SUPPORTED_TYPES = {
  PDF: ['application/pdf'],
  WORD: [
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  TEXT: ['text/plain', 'text/csv', 'text/markdown'],
  IMAGE: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
};

/**
 * Extrait le texte d'un fichier selon son type
 * @param filePath - Chemin relatif du fichier (ex: /uploads/userId/file.pdf)
 * @param mimeType - Type MIME du fichier
 * @returns Le texte extrait ou null si non supporté
 */
export async function extractTextFromFile(
  filePath: string,
  mimeType: string
): Promise<string | null> {
  try {
    // Construire le chemin absolu
    const absolutePath = join(process.cwd(), 'public', filePath);

    // PDF
    if (SUPPORTED_TYPES.PDF.includes(mimeType)) {
      return await extractTextFromPDF(absolutePath);
    }

    // Word (.doc, .docx)
    if (SUPPORTED_TYPES.WORD.includes(mimeType)) {
      return await extractTextFromWord(absolutePath);
    }

    // Texte brut
    if (SUPPORTED_TYPES.TEXT.includes(mimeType)) {
      return await extractTextFromPlainText(absolutePath);
    }

    // Images - pas d'extraction de texte pour l'instant
    // TODO: Ajouter OCR si nécessaire
    if (SUPPORTED_TYPES.IMAGE.includes(mimeType)) {
      return null;
    }

    console.log(`Type non supporté pour l'extraction: ${mimeType}`);
    return null;
  } catch (error) {
    console.error(`Erreur extraction texte pour ${filePath}:`, error);
    return null;
  }
}

/**
 * Extrait le texte d'un fichier PDF
 */
async function extractTextFromPDF(absolutePath: string): Promise<string | null> {
  try {
    // Import dynamique pour éviter les erreurs côté client
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfParseModule = await import('pdf-parse') as any;
    const pdfParse = pdfParseModule.default || pdfParseModule;
    const buffer = await readFile(absolutePath);
    const data = await pdfParse(buffer);
    return cleanExtractedText(data.text);
  } catch (error) {
    console.error('Erreur extraction PDF:', error);
    return null;
  }
}

/**
 * Extrait le texte d'un fichier Word (.doc, .docx)
 */
async function extractTextFromWord(absolutePath: string): Promise<string | null> {
  try {
    const buffer = await readFile(absolutePath);
    const result = await mammoth.extractRawText({ buffer });
    return cleanExtractedText(result.value);
  } catch (error) {
    console.error('Erreur extraction Word:', error);
    return null;
  }
}

/**
 * Lit un fichier texte brut
 */
async function extractTextFromPlainText(absolutePath: string): Promise<string | null> {
  try {
    const content = await readFile(absolutePath, 'utf-8');
    return cleanExtractedText(content);
  } catch (error) {
    console.error('Erreur lecture fichier texte:', error);
    return null;
  }
}

/**
 * Nettoie le texte extrait
 * - Supprime les espaces multiples
 * - Supprime les lignes vides multiples
 * - Trim le résultat
 */
function cleanExtractedText(text: string): string {
  return text
    .replace(/\r\n/g, '\n') // Normaliser les fins de ligne
    .replace(/\n{3,}/g, '\n\n') // Max 2 lignes vides consécutives
    .replace(/[ \t]+/g, ' ') // Espaces multiples → un seul
    .replace(/ \n/g, '\n') // Supprimer espaces avant newline
    .replace(/\n /g, '\n') // Supprimer espaces après newline
    .trim();
}

/**
 * Extrait le texte à partir d'un buffer (pour l'extraction pendant l'upload)
 */
export async function extractTextFromBuffer(
  buffer: Buffer,
  mimeType: string,
  filename: string
): Promise<string | null> {
  try {
    // PDF
    if (SUPPORTED_TYPES.PDF.includes(mimeType)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pdfParseModule = await import('pdf-parse') as any;
      const pdfParse = pdfParseModule.default || pdfParseModule;
      const data = await pdfParse(buffer);
      return cleanExtractedText(data.text);
    }

    // Word
    if (SUPPORTED_TYPES.WORD.includes(mimeType)) {
      const result = await mammoth.extractRawText({ buffer });
      return cleanExtractedText(result.value);
    }

    // Texte brut
    if (SUPPORTED_TYPES.TEXT.includes(mimeType)) {
      return cleanExtractedText(buffer.toString('utf-8'));
    }

    return null;
  } catch (error) {
    console.error(`Erreur extraction buffer (${filename}):`, error);
    return null;
  }
}

/**
 * Vérifie si un type MIME supporte l'extraction de texte
 */
export function isTextExtractable(mimeType: string): boolean {
  return (
    SUPPORTED_TYPES.PDF.includes(mimeType) ||
    SUPPORTED_TYPES.WORD.includes(mimeType) ||
    SUPPORTED_TYPES.TEXT.includes(mimeType)
  );
}
