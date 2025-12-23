# Phase 9 - Intégration IA

> **Objectif** : IA utile, contrôlée, stable en démo  
> **Fichiers TODO** : `phase-09-ia.md`  
> **Fichiers code** : `phase-09-code.md`

---

## 🎯 Prompts Optimisés par Tâche

---

## 📋 Étape 9.1 — Config API OpenAI

### Prompt 9.1.1 — Installation

```
npm install openai ai

Ajouter dans .env.local :
OPENAI_API_KEY=sk-xxx

Ajouter dans .env.example :
OPENAI_API_KEY=your-openai-api-key
```

### Prompt 9.1.2 — Client OpenAI

```
Créer `src/lib/ai/openai.ts` :

import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
```

### Prompt 9.1.3 — Test API

```
Créer `src/app/api/ai/test/route.ts` :

import { openai } from '@/lib/ai/openai';

export async function GET() {
  try {
    const models = await openai.models.list();
    return Response.json({ success: true, modelsCount: models.data.length });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

Tester : http://localhost:3000/api/ai/test
```

---

## 📋 Étape 9.2 — Chat IA Basique

### Prompt 9.2.1 — API Chat Streaming

```
Créer `src/app/api/ai/chat/route.ts` :

import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4o-mini'),
    system: "Tu es Blaiz'bot, un assistant pédagogique bienveillant pour les collégiens.",
    messages,
  });

  return result.toDataStreamResponse();
}
```

### Prompt 9.2.2 — ChatContainer

```
Créer `src/components/features/ai/ChatContainer.tsx` :

'use client';

import { useChat } from 'ai/react';
import { ChatMessageList } from './ChatMessageList';
import { ChatInput } from './ChatInput';

export function ChatContainer() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/ai/chat',
  });

  return (
    <div className="flex flex-col h-[600px]">
      <ChatMessageList messages={messages} isLoading={isLoading} />
      <ChatInput
        input={input}
        onChange={handleInputChange}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}
```

### Prompt 9.2.3 — ChatMessageList

```
Créer `src/components/features/ai/ChatMessageList.tsx` :

Props : { messages, isLoading }

- Map sur les messages
- user → bulle droite, bleue
- assistant → bulle gauche, grise
- Auto-scroll vers le bas
- Indicateur de chargement
```

### Prompt 9.2.4 — ChatInput

```
Créer `src/components/features/ai/ChatInput.tsx` :

Props : { input, onChange, onSubmit, isLoading }

- Textarea avec auto-resize
- Enter = envoyer, Shift+Enter = nouvelle ligne
- Bouton envoyer (disabled si vide ou loading)
```

### Prompt 9.2.5 — Page AI

```
Modifier `src/app/(dashboard)/student/ai/page.tsx` :

import { ChatContainer } from '@/components/features/ai/ChatContainer';

export default function AIPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1>Assistant BlaizBot</h1>
      <ChatContainer />
    </div>
  );
}
```

---

## 📋 Étape 9.3 — Règles Pédagogiques

### Prompt 9.3.1 — System Prompts

```
Créer `src/lib/ai/prompts.ts` :

export const PROMPTS = {
  hint: `Tu es Blaiz'bot, assistant pédagogique. 
RÈGLE : Ne donne JAMAIS la réponse directe.
Tu guides l'élève avec des indices et des questions.
"Qu'est-ce que tu as déjà essayé ?"
"Que se passe-t-il si tu..."`,

  explain: `Tu es Blaiz'bot, assistant pédagogique.
Tu expliques clairement les concepts.
Tu peux donner des réponses complètes.
Utilise des exemples concrets.`,
};
```

### Prompt 9.3.2 — Mode Toggle

```
Créer `src/components/features/ai/ModeToggle.tsx` :

Props : { mode, onModeChange }

Deux boutons ou toggle :
- 💡 Mode Indice (hint)
- 📖 Mode Explication (explain)
```

### Prompt 9.3.3 — API avec Mode

```
Modifier `/api/ai/chat` pour accepter `mode` dans le body :

const { messages, mode = 'hint' } = await req.json();
const systemPrompt = mode === 'explain' ? PROMPTS.explain : PROMPTS.hint;
```

---

## 📋 Étape 9.4 — Génération Quiz (Optionnel)

### Prompt 9.4.1 — API Quiz

```
Créer `src/app/api/ai/quiz/route.ts` :

POST avec { topic, difficulty, count }

Génère un quiz JSON :
{
  questions: [
    { question: "...", options: ["A", "B", "C", "D"], answer: 0 }
  ]
}
```

### Prompt 9.4.2 — QuizGenerator

```
Créer un composant qui :
1. Demande le sujet
2. Appelle l'API
3. Affiche le quiz interactif
4. Calcule le score
```

---

## 📊 Validation Finale Phase 9

```
Checklist :
1. /api/ai/test → 200 OK
2. Chat fonctionne avec streaming
3. Mode hint ne donne pas les réponses
4. Mode explain donne des explications
5. Gestion timeout/erreur OpenAI
6. Quiz générable (optionnel)
```

---

## 📖 Journal des Itérations

| Étape | Date | Durée | Itérations | Rétro-prompt |
|-------|------|-------|------------|--------------|
| 9.1 | | | | |
| 9.2 | | | | |
| 9.3 | | | | |
| 9.4 | | | | |

---

*Dernière mise à jour : 2025-01-13*
