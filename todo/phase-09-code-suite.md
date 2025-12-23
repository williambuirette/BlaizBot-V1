# 📄 Code & Templates — Phase 9 (Partie 2)

> Suite du code source pour la Phase 9 (Intégration IA).
> **Précédent** : [phase-09-code.md](phase-09-code.md)

---

## 8. Embeddings Library

```typescript
// src/lib/ai/embeddings.ts
import { openai } from './openai';

const EMBEDDING_MODEL = 'text-embedding-3-small';
const CHUNK_SIZE = 500; // tokens approximatifs
const CHUNK_OVERLAP = 50;

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
  });
  return response.data[0].embedding;
}

export function chunkText(text: string, chunkSize = CHUNK_SIZE, overlap = CHUNK_OVERLAP): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  let i = 0;

  while (i < words.length) {
    const chunk = words.slice(i, i + chunkSize).join(' ');
    chunks.push(chunk);
    i += chunkSize - overlap;
  }

  return chunks;
}

export async function embedChunks(chunks: string[]): Promise<number[][]> {
  const embeddings: number[][] = [];
  for (const chunk of chunks) {
    const embedding = await generateEmbedding(chunk);
    embeddings.push(embedding);
  }
  return embeddings;
}
```

---

## 9. RAG Search Library

```typescript
// src/lib/ai/rag.ts
import { prisma } from '@/lib/prisma';
import { generateEmbedding, chunkText, embedChunks } from './embeddings';

interface SearchOptions {
  subjectId?: string;
  limit?: number;
  threshold?: number;
}

interface SearchResult {
  chunkId: string;
  content: string;
  relevance: number;
  documentId: string;
}

export async function embedDocument(documentId: string): Promise<void> {
  const document = await prisma.document.findUnique({ where: { id: documentId } });
  if (!document) throw new Error('Document not found');

  const chunks = chunkText(document.content);
  const embeddings = await embedChunks(chunks);

  // Supprimer anciens chunks
  await prisma.documentChunk.deleteMany({ where: { documentId } });

  // Créer nouveaux chunks
  for (let i = 0; i < chunks.length; i++) {
    await prisma.$executeRaw`
      INSERT INTO document_chunks (id, document_id, content, embedding)
      VALUES (gen_random_uuid(), ${documentId}, ${chunks[i]}, ${embeddings[i]}::vector)
    `;
  }
}

export async function searchSimilar(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
  const { limit = 5, threshold = 0.7 } = options;

  const queryEmbedding = await generateEmbedding(query);

  const results = await prisma.$queryRaw<SearchResult[]>`
    SELECT 
      id as "chunkId",
      content,
      document_id as "documentId",
      1 - (embedding <=> ${queryEmbedding}::vector) as relevance
    FROM document_chunks
    WHERE 1 - (embedding <=> ${queryEmbedding}::vector) > ${threshold}
    ORDER BY embedding <=> ${queryEmbedding}::vector
    LIMIT ${limit}
  `;

  return results;
}
```

---

## 10. API /api/ai/chat avec RAG

```typescript
// src/app/api/ai/chat/route.ts (version avec RAG)
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { auth } from '@/lib/auth';
import { getSystemPrompt } from '@/lib/ai/prompts';
import { searchSimilar } from '@/lib/ai/rag';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { messages, mode = 'hint', courseId } = await req.json();

  let systemPrompt = getSystemPrompt(mode);

  // Si courseId, activer RAG
  if (courseId) {
    const lastMessage = messages[messages.length - 1]?.content || '';
    const chunks = await searchSimilar(lastMessage, { limit: 3 });

    if (chunks.length > 0) {
      const context = chunks.map((c) => c.content).join('\n\n---\n\n');
      systemPrompt += `\n\nCONTEXTE DU COURS (utilise ces infos pour répondre) :\n${context}`;
    }
  }

  const result = await streamText({
    model: openai('gpt-4o-mini'),
    system: systemPrompt,
    messages,
  });

  return result.toDataStreamResponse();
}
```

---

## 11. Quiz Generation Library

```typescript
// src/lib/ai/quiz.ts
import { openai } from './openai';

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Quiz {
  questions: QuizQuestion[];
}

export async function generateQuiz(content: string, count = 5): Promise<Quiz> {
  const prompt = `Génère un quiz de ${count} questions QCM sur le contenu suivant.

FORMAT JSON STRICT (uniquement du JSON, pas de texte avant ou après) :
{
  "questions": [
    {
      "question": "Question claire et précise",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Explication de la bonne réponse"
    }
  ]
}

CONTENU :
${content}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  });

  const json = response.choices[0].message.content;
  if (!json) throw new Error('No response from OpenAI');

  return JSON.parse(json) as Quiz;
}
```

---

## 12. QuizViewer Component

```tsx
// src/components/features/ai/QuizViewer.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle } from 'lucide-react';
import type { Quiz } from '@/lib/ai/quiz';

interface QuizViewerProps {
  quiz: Quiz;
  onComplete?: (score: number) => void;
}

export function QuizViewer({ quiz, onComplete }: QuizViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const question = quiz.questions[currentIndex];

  const handleSelect = (index: number) => {
    if (answered) return;
    setSelected(index);
    setAnswered(true);
    if (index === question.correctIndex) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < quiz.questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      setFinished(true);
      onComplete?.(score);
    }
  };

  if (finished) {
    return (
      <Card className="text-center">
        <CardHeader>
          <CardTitle>Quiz terminé ! 🎉</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">{score}/{quiz.questions.length}</p>
          <p className="text-muted-foreground mt-2">
            {score === quiz.questions.length ? 'Parfait !' : 'Continue comme ça !'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Question {currentIndex + 1}/{quiz.questions.length}</CardTitle>
        <p className="text-base mt-2">{question.question}</p>
      </CardHeader>
      <CardContent className="space-y-2">
        {question.options.map((opt, i) => (
          <Button
            key={i}
            variant="outline"
            className={cn('w-full justify-start text-left h-auto py-3', {
              'border-green-500 bg-green-50': answered && i === question.correctIndex,
              'border-red-500 bg-red-50': answered && i === selected && i !== question.correctIndex,
            })}
            onClick={() => handleSelect(i)}
            disabled={answered}
          >
            {answered && i === question.correctIndex && <CheckCircle className="mr-2 h-4 w-4 text-green-600" />}
            {answered && i === selected && i !== question.correctIndex && <XCircle className="mr-2 h-4 w-4 text-red-600" />}
            {opt}
          </Button>
        ))}
        {answered && <p className="text-sm text-muted-foreground mt-4">{question.explanation}</p>}
      </CardContent>
      <CardFooter>
        <Button onClick={handleNext} disabled={!answered} className="w-full">
          {currentIndex < quiz.questions.length - 1 ? 'Question suivante' : 'Voir le score'}
        </Button>
      </CardFooter>
    </Card>
  );
}
```

---

## 13. Revision Generation Library

```typescript
// src/lib/ai/revision.ts
import { openai } from './openai';

export async function generateRevisionSheet(content: string, topic: string): Promise<string> {
  const prompt = `Crée une fiche de révision sur "${topic}".

STRUCTURE OBLIGATOIRE (en Markdown) :
## 🎯 ESSENTIEL
(3-5 points clés à retenir absolument)

## 📖 DÉFINITIONS
(Termes importants avec explications simples)

## 💡 EXEMPLES
(Exemples concrets et mémorisables)

## ⚠️ PIÈGES À ÉVITER
(Erreurs fréquentes)

## 🔑 À RETENIR
(Formules, dates clés, noms importants)

CONTENU SOURCE :
${content}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
  });

  return response.choices[0].message.content || '';
}
```

---

## 14. API /api/ai/revision

```typescript
// src/app/api/ai/revision/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { generateRevisionSheet } from '@/lib/ai/revision';

const schema = z.object({
  courseId: z.string().cuid(),
  title: z.string().min(3),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { courseId, title } = schema.parse(body);

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { subject: true },
    });
    if (!course) {
      return NextResponse.json({ error: 'Cours non trouvé' }, { status: 404 });
    }

    const content = await generateRevisionSheet(course.content, title);

    const revision = await prisma.revision.create({
      data: {
        title,
        content,
        userId: session.user.id,
        subjectId: course.subjectId,
      },
    });

    return NextResponse.json(revision, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
```

---

> **Retour** : [phase-09-ai.md](phase-09-ai.md)

---

*Dernière MAJ : 2025-12-22*
