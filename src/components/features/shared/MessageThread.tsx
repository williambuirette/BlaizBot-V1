'use client';

import { useState, useRef, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Send, Loader2, User, ArrowLeft, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderRole?: 'STUDENT' | 'TEACHER' | 'ADMIN';
  createdAt: string;
}

interface Participant {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface CourseRef {
  id: string;
  title: string;
}

interface MessageThreadProps {
  /** ID de la conversation */
  conversationId: string;
  /** Titre affiché dans le header */
  conversationTitle: string;
  /** Liste des participants */
  participants: Participant[];
  /** Matière associée (optionnel) */
  subject?: { id: string; name: string } | null;
  /** Cours associé (optionnel) */
  course?: CourseRef | null;
  /** ID de l'utilisateur connecté */
  currentUserId: string;
  /** URL de l'API pour récupérer les messages (ex: /api/teacher/messages ou /api/student/messages) */
  apiBaseUrl: string;
  /** Callback pour revenir à la liste (mobile) */
  onBack?: () => void;
  /** Callback pour envoyer un message */
  onSendMessage: (content: string) => Promise<void>;
  /** Callback pour marquer comme lu */
  onMarkAsRead?: () => void;
}

/**
 * Composant réutilisable pour afficher un fil de messages style chat.
 * Utilisable par les interfaces teacher et student.
 */
export function MessageThread({
  conversationId,
  conversationTitle,
  participants,
  subject,
  course,
  currentUserId,
  apiBaseUrl,
  onBack,
  onSendMessage,
  onMarkAsRead,
}: MessageThreadProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasMarkedAsRead = useRef(false);

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiBaseUrl}/${conversationId}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages || []);
        }
      } catch (error) {
        console.error('Erreur fetch messages:', error);
      } finally {
        setLoading(false);
      }
    };

    if (conversationId) {
      fetchMessages();
      hasMarkedAsRead.current = false; // Reset when conversation changes
    }
  }, [conversationId, apiBaseUrl]);

  // Marquer les messages comme lus à l'ouverture
  useEffect(() => {
    if (!loading && messages.length > 0 && onMarkAsRead && !hasMarkedAsRead.current) {
      hasMarkedAsRead.current = true;
      onMarkAsRead();
    }
  }, [loading, messages, onMarkAsRead]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      await onSendMessage(newMessage.trim());

      // Ajouter le message localement pour feedback immédiat
      const newMsg: Message = {
        id: `temp-${Date.now()}`,
        content: newMessage.trim(),
        senderId: currentUserId,
        senderName: 'Vous',
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, newMsg]);
      setNewMessage('');
      inputRef.current?.focus();
    } catch (error) {
      console.error('Erreur envoi message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack} className="md:hidden">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg">{conversationTitle}</CardTitle>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              {participants.map((p) => (
                <span key={p.id} className="text-sm text-muted-foreground">
                  {p.firstName} {p.lastName}
                </span>
              ))}
              {/* Badge cours */}
              {course && (
                <Badge variant="secondary" className="text-xs flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  {course.title}
                </Badge>
              )}
              {/* Badge matière (si pas de cours) */}
              {subject && !course && (
                <Badge variant="outline" className="text-xs">
                  {subject.name}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 flex flex-col">
        {/* Zone des messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <p>Aucun message</p>
              <p className="text-sm">Envoyez le premier message !</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => {
                const isOwn = msg.senderId === currentUserId;
                const isTeacher = msg.senderRole === 'TEACHER';
                return (
                  <div key={msg.id} className={cn('flex gap-3', isOwn && 'justify-end')}>
                    {!isOwn && (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                    <div
                      className={cn(
                        'max-w-[70%] rounded-2xl px-4 py-2',
                        isOwn
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-muted rounded-bl-md'
                      )}
                    >
                      {!isOwn && (
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-xs font-medium">{msg.senderName}</p>
                          {isTeacher && (
                            <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                              Prof
                            </Badge>
                          )}
                        </div>
                      )}
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      <p
                        className={cn(
                          'text-xs mt-1',
                          isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        )}
                      >
                        {formatDistanceToNow(new Date(msg.createdAt), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Zone de saisie */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              placeholder="Écrivez votre message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={sending}
            />
            <Button onClick={handleSend} disabled={!newMessage.trim() || sending}>
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
