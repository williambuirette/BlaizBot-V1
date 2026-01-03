// MessageThread - Fil de messages style chat réutilisable
// Refactorisé : 444 → ~220 lignes

'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Send, Loader2, User, ArrowLeft, BookOpen, Paperclip, X } from 'lucide-react';

// Sub-components
import { 
  type Message, 
  type MessageThreadProps, 
  MessageBubble,
  formatFileSize,
} from './message-thread';

// Re-export types pour compatibilité
export type { Message, Participant, CourseRef, MessageThreadProps } from './message-thread';

export function MessageThread({
  conversationId,
  conversationTitle,
  participants,
  subject,
  course,
  currentUserId,
  apiBaseUrl,
  onBack,
  onMarkAsRead,
}: MessageThreadProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
      hasMarkedAsRead.current = false;
    }
  }, [conversationId, apiBaseUrl]);

  // Marquer les messages comme lus
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

  // Télécharger un fichier
  const handleDownloadFile = async (messageId: string, filename: string) => {
    const downloadUrl = `${apiBaseUrl}/${conversationId}/files/${messageId}/${encodeURIComponent(filename)}`;
    try {
      const res = await fetch(downloadUrl);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        alert(res.status === 404 
          ? 'Fichier introuvable.' 
          : `Erreur: ${errorData.error || res.status}`);
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
    } catch (error) {
      console.error('Erreur téléchargement:', error);
      alert('Erreur lors du téléchargement');
    }
  };

  const handleSend = async () => {
    if ((!newMessage.trim() && attachments.length === 0) || sending) return;

    setSending(true);
    try {
      const formData = new FormData();
      formData.append('content', newMessage.trim() || '(fichier joint)');
      attachments.forEach((file) => formData.append('attachments', file));

      const res = await fetch(`${apiBaseUrl}/${conversationId}`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Erreur envoi message');

      const data = await res.json();
      const newMsg: Message = {
        id: data.data.id,
        content: data.data.content,
        senderId: currentUserId,
        senderName: 'Vous',
        createdAt: data.data.createdAt,
      };
      setMessages((prev) => [...prev, newMsg]);
      setNewMessage('');
      setAttachments([]);
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments((prev) => [...prev, ...Array.from(e.target.files!)]);
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
              {course && (
                <Badge variant="secondary" className="text-xs flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  {course.title}
                </Badge>
              )}
              {subject && !course && (
                <Badge variant="outline" className="text-xs">{subject.name}</Badge>
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
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isOwn={msg.senderId === currentUserId}
                  onDownloadFile={handleDownloadFile}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Zone de saisie */}
        <div className="p-4 border-t">
          {attachments.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {attachments.map((file, index) => (
                <div key={index} className="text-xs bg-muted px-2 py-1 rounded flex items-center gap-2">
                  <span className="max-w-[150px] truncate">{file.name}</span>
                  <span className="text-muted-foreground">({formatFileSize(file.size)})</span>
                  <button
                    onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== index))}
                    className="hover:text-destructive"
                    type="button"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              type="button"
              disabled={sending}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Input
              ref={inputRef}
              placeholder="Écrivez votre message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={sending}
            />
            <Button
              onClick={handleSend}
              disabled={(!newMessage.trim() && attachments.length === 0) || sending}
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
