# 📄 Code & Templates — Phase 9 (Partie 1)

> Code source pour la Phase 9 (Intégration IA).
> **Utilisé par** : [phase-09-ai.md](phase-09-ai.md)
> **Suite** : [phase-09-code-suite.md](phase-09-code-suite.md)

---

## 1. Client OpenAI

```typescript
// src/lib/ai/openai.ts
import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Test de connexion
export async function testConnection() {
  try {
    await openai.models.list();
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
```

---

## 2. API /api/ai/chat (Streaming)

```typescript
// src/app/api/ai/chat/route.ts
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { auth } from '@/lib/auth';
import { getSystemPrompt } from '@/lib/ai/prompts';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { messages, mode = 'hint' } = await req.json();

  const systemPrompt = getSystemPrompt(mode);

  const result = await streamText({
    model: openai('gpt-4o-mini'),
    system: systemPrompt,
    messages,
  });

  return result.toDataStreamResponse();
}
```

---

## 3. Prompts Pédagogiques

```typescript
// src/lib/ai/prompts.ts
export type AIMode = 'hint' | 'explain';

export const SYSTEM_PROMPT_HINT = `Tu es Blaiz'bot, un tuteur bienveillant pour élèves de collège/lycée.

RÈGLES STRICTES :
- Ne donne JAMAIS la réponse directement
- Guide l'élève avec des indices progressifs
- Pose des questions pour faire réfléchir : "Qu'est-ce que tu remarques ?"
- Félicite les efforts et encourage
- Utilise des analogies simples

EXEMPLE :
Élève : "Comment résoudre 2x + 4 = 10 ?"
Toi : "Bonne question ! Réfléchis : que dois-tu faire pour isoler le x ? 
Indice : commence par te débarrasser du +4..."`;

export const SYSTEM_PROMPT_EXPLAIN = `Tu es Blaiz'bot, un tuteur bienveillant pour élèves de collège/lycée.

RÈGLES :
- Explique de manière complète et claire
- Montre la démarche pas à pas
- Utilise des exemples concrets
- Structure ta réponse avec des étapes numérotées
- Donne la réponse finale avec explications

EXEMPLE :
Élève : "Comment résoudre 2x + 4 = 10 ?"
Toi : "Je t'explique étape par étape :
1. On veut isoler x
2. On soustrait 4 des deux côtés : 2x = 6
3. On divise par 2 : x = 3
Donc x = 3 ✓"`;

export function getSystemPrompt(mode: AIMode): string {
  return mode === 'hint' ? SYSTEM_PROMPT_HINT : SYSTEM_PROMPT_EXPLAIN;
}
```

---

## 4. ChatContainer Component

```tsx
// src/components/features/ai/ChatContainer.tsx
'use client';

import { useChat } from 'ai/react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot } from 'lucide-react';
import { ChatMessageList } from './ChatMessageList';
import { ChatInput } from './ChatInput';
import { ModeToggle } from './ModeToggle';

interface ChatContainerProps {
  courseId?: string;
}

export function ChatContainer({ courseId }: ChatContainerProps) {
  const [mode, setMode] = useState<'hint' | 'explain'>('hint');

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/api/ai/chat',
    body: { mode, courseId },
  });

  return (
    <Card className="flex flex-col h-[600px]">
      <CardHeader className="flex-shrink-0 flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          Assistant BlaizBot
        </CardTitle>
        <ModeToggle mode={mode} onModeChange={setMode} />
      </CardHeader>
      <CardContent className="flex-1 flex flex-col overflow-hidden p-0">
        <ChatMessageList messages={messages} isLoading={isLoading} />
        {error && (
          <p className="px-4 py-2 text-sm text-red-500">
            Erreur : {error.message}
          </p>
        )}
        <ChatInput
          input={input}
          onChange={handleInputChange}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  );
}
```

---

## 5. ChatMessageList Component

```tsx
// src/components/features/ai/ChatMessageList.tsx
'use client';

import { useEffect, useRef } from 'react';
import { Message } from 'ai';
import { cn } from '@/lib/utils';
import { Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ChatMessageListProps {
  messages: Message[];
  isLoading: boolean;
}

export function ChatMessageList({ messages, isLoading }: ChatMessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 && (
        <p className="text-center text-muted-foreground">
          👋 Pose-moi une question sur tes cours !
        </p>
      )}
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={cn('flex items-start gap-3', msg.role === 'user' && 'flex-row-reverse')}
        >
          <div className={cn('p-2 rounded-full', msg.role === 'user' ? 'bg-primary' : 'bg-muted')}>
            {msg.role === 'user' ? (
              <User className="h-4 w-4 text-primary-foreground" />
            ) : (
              <Bot className="h-4 w-4" />
            )}
          </div>
          <div
            className={cn(
              'max-w-[80%] rounded-lg px-4 py-2 prose prose-sm dark:prose-invert',
              msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
            )}
          >
            <ReactMarkdown>{msg.content}</ReactMarkdown>
          </div>
        </div>
      ))}
      {isLoading && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Bot className="h-4 w-4 animate-pulse" />
          <span>Blaiz'bot réfléchit...</span>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
```

---

## 6. ChatInput Component

```tsx
// src/components/features/ai/ChatInput.tsx
'use client';

import { FormEvent, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';

interface ChatInputProps {
  input: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
}

export function ChatInput({ input, onChange, onSubmit, isLoading }: ChatInputProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit(e as unknown as FormEvent<HTMLFormElement>);
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex items-end gap-2 p-4 border-t">
      <Textarea
        value={input}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        placeholder="Pose ta question..."
        className="min-h-[60px] max-h-[120px] resize-none"
        disabled={isLoading}
      />
      <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
}
```

---

## 7. ModeToggle Component

```tsx
// src/components/features/ai/ModeToggle.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Lightbulb, BookOpen } from 'lucide-react';

interface ModeToggleProps {
  mode: 'hint' | 'explain';
  onModeChange: (mode: 'hint' | 'explain') => void;
}

export function ModeToggle({ mode, onModeChange }: ModeToggleProps) {
  return (
    <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
      <Button
        variant={mode === 'hint' ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => onModeChange('hint')}
        className="gap-1"
      >
        <Lightbulb className="h-4 w-4" />
        <span className="hidden sm:inline">Indices</span>
      </Button>
      <Button
        variant={mode === 'explain' ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => onModeChange('explain')}
        className="gap-1"
      >
        <BookOpen className="h-4 w-4" />
        <span className="hidden sm:inline">Explications</span>
      </Button>
    </div>
  );
}
```

---

> **Suite** : [phase-09-code-suite.md](phase-09-code-suite.md) (RAG, Quiz, Fiches)

---

*Dernière MAJ : 2025-12-22*
