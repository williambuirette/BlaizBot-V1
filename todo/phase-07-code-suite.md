# 📄 Code & Templates — Phase 7 (Partie 2)

> Suite du code source pour la Phase 7 (Interface Professeur).
> **Précédent** : [phase-07-code.md](phase-07-code.md)

---

## 6. CoursesTable Component

```tsx
// src/components/features/teacher/CoursesTable.tsx
'use client';

import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';
import { useState } from 'react';

interface Course {
  id: string;
  title: string;
  description: string | null;
  subject: { name: string; color: string };
  chapters: { id: string }[];
  createdAt: string;
}

interface CoursesTableProps {
  courses: Course[];
  onDelete: (id: string) => void;
}

export function CoursesTable({ courses, onDelete }: CoursesTableProps) {
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce cours ?')) return;
    setDeleting(id);
    await onDelete(id);
    setDeleting(null);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Titre</TableHead>
          <TableHead>Matière</TableHead>
          <TableHead>Chapitres</TableHead>
          <TableHead>Créé le</TableHead>
          <TableHead className="w-[80px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {courses.map((course) => (
          <TableRow key={course.id}>
            <TableCell className="font-medium">{course.title}</TableCell>
            <TableCell>
              <Badge style={{ backgroundColor: course.subject.color }} className="text-white">
                {course.subject.name}
              </Badge>
            </TableCell>
            <TableCell>{course.chapters.length}</TableCell>
            <TableCell>{new Date(course.createdAt).toLocaleDateString('fr-FR')}</TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" disabled={deleting === course.id}>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/teacher/courses/${course.id}`}>
                      <Eye className="mr-2 h-4 w-4" />Voir
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/teacher/courses/${course.id}/edit`}>
                      <Edit className="mr-2 h-4 w-4" />Modifier
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDelete(course.id)} className="text-red-600">
                    <Trash2 className="mr-2 h-4 w-4" />Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

---

## 7. MessageThread Component

```tsx
// src/components/features/messaging/MessageThread.tsx
'use client';

import { useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Message {
  id: string;
  content: string;
  createdAt: string;
  sender: { id: string; firstName: string; lastName: string; avatar: string | null };
}

interface MessageThreadProps {
  messages: Message[];
  currentUserId: string;
}

export function MessageThread({ messages, currentUserId }: MessageThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((msg) => {
        const isMine = msg.sender.id === currentUserId;
        const initials = `${msg.sender.firstName[0]}${msg.sender.lastName[0]}`;
        return (
          <div key={msg.id} className={cn('flex items-end gap-2', isMine && 'flex-row-reverse')}>
            <Avatar className="h-8 w-8">
              {msg.sender.avatar && <AvatarImage src={msg.sender.avatar} />}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className={cn('max-w-[70%] rounded-lg px-3 py-2', isMine ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
              <p className="text-sm">{msg.content}</p>
              <p className={cn('text-xs mt-1', isMine ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
                {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true, locale: fr })}
              </p>
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
```

---

## 8. MessageInput Component

```tsx
// src/components/features/messaging/MessageInput.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';

interface MessageInputProps {
  onSend: (content: string) => Promise<void>;
  disabled?: boolean;
}

export function MessageInput({ onSend, disabled }: MessageInputProps) {
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || sending) return;
    setSending(true);
    try {
      await onSend(content.trim());
      setContent('');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2 p-4 border-t">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Votre message..."
        className="min-h-[60px] max-h-[120px] resize-none"
        disabled={disabled || sending}
      />
      <Button type="submit" size="icon" disabled={disabled || sending || !content.trim()}>
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
}
```

---

## 9. API /api/teacher/messages

```typescript
// src/app/api/teacher/messages/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

const messageSchema = z.object({
  receiverId: z.string().cuid(),
  content: z.string().min(1).max(2000),
});

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const conversationWith = searchParams.get('with');

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: session.user.id, receiverId: conversationWith ?? undefined },
        { receiverId: session.user.id, senderId: conversationWith ?? undefined },
      ],
    },
    include: { sender: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json(messages);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = messageSchema.parse(body);

    const message = await prisma.message.create({
      data: { senderId: session.user.id, ...data },
      include: { sender: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
```

---

> **Retour** : [phase-07-teacher.md](phase-07-teacher.md)

---

*Dernière MAJ : 2025-12-22*
