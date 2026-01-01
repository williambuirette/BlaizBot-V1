'use client';

import { useState, useRef, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Send, Loader2, User, ArrowLeft, BookOpen, Paperclip, X, FileText, Image, FileSpreadsheet } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderRole?: 'STUDENT' | 'TEACHER' | 'ADMIN';
  createdAt: string;
  attachments?: { name: string; size: number; type: string }[] | null;
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

  // Icône selon le type de fichier
  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText className="h-3 w-3" />;
    if (type.includes('image')) return <Image className="h-3 w-3" />;
    if (type.includes('sheet') || type.includes('excel')) return <FileSpreadsheet className="h-3 w-3" />;
    if (type.includes('word') || type.includes('document')) return <FileText className="h-3 w-3" />;
    if (type.includes('presentation') || type.includes('powerpoint')) return <FileText className="h-3 w-3" />;
    return <Paperclip className="h-3 w-3" />;
  };

  // Formater la taille du fichier
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Télécharger un fichier
  const handleDownloadFile = async (messageId: string, filename: string) => {
    const downloadUrl = `${apiBaseUrl}/${conversationId}/files/${messageId}/${encodeURIComponent(filename)}`;
    console.log('📥 Tentative de téléchargement:', downloadUrl);
    
    try {
      const res = await fetch(downloadUrl);

      if (!res.ok) {
        // Essayer de récupérer le message d'erreur du serveur
        const errorData = await res.json().catch(() => ({}));
        const errorMessage = errorData.error || `Erreur ${res.status}`;
        
        console.error('❌ Erreur serveur:', res.status, errorMessage);
        
        if (res.status === 404) {
          alert(
            'Fichier introuvable.\n\n' +
            'Ce fichier a peut-être été uploadé avant l\'activation du stockage physique.\n' +
            'Essayez d\'uploader un nouveau fichier pour tester le téléchargement.'
          );
        } else {
          alert(`Impossible de télécharger le fichier: ${errorMessage}`);
        }
        return;
      }

      // Récupérer le blob
      const blob = await res.blob();

      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();

      console.log('✅ Téléchargement réussi:', filename);
    } catch (error) {
      console.error('❌ Erreur téléchargement:', error);
      
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        alert(
          'Impossible de se connecter au serveur.\n\n' +
          'Vérifiez que le serveur de développement est démarré (npm run dev).\n\n' +
          `URL tentée: ${downloadUrl}`
        );
      } else {
        alert(`Erreur inattendue lors du téléchargement:\n${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      }
    }
  };

  const handleSend = async () => {
    if ((!newMessage.trim() && attachments.length === 0) || sending) return;

    setSending(true);
    try {
      // Créer FormData pour envoyer texte + fichiers
      const formData = new FormData();
      formData.append('content', newMessage.trim() || '(fichier joint)');
      
      // Ajouter les fichiers
      attachments.forEach((file) => {
        formData.append('attachments', file);
      });

      // Envoyer via l'API directe
      const res = await fetch(`${apiBaseUrl}/${conversationId}`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Erreur envoi message');
      }

      const data = await res.json();

      // Ajouter le message localement pour feedback immédiat
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
      const selectedFiles = Array.from(e.target.files);
      setAttachments((prev) => [...prev, ...selectedFiles]);
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
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
                      {msg.content && <p className="text-sm whitespace-pre-wrap">{msg.content}</p>}
                      
                      {/* Pièces jointes */}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {msg.attachments.map((file, idx) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="cursor-pointer hover:bg-secondary/80 flex items-center gap-2 w-fit"
                              onClick={() => handleDownloadFile(msg.id, file.name)}
                            >
                              {getFileIcon(file.type)}
                              <span className="text-xs">{file.name}</span>
                              <span className="text-xs opacity-70">({formatFileSize(file.size)})</span>
                            </Badge>
                          ))}
                        </div>
                      )}
                      
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
          {/* Affichage des fichiers sélectionnés */}
          {attachments.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {attachments.map((file, index) => (
                <div
                  key={index}
                  className="text-xs bg-muted px-2 py-1 rounded flex items-center gap-2"
                >
                  <span className="max-w-[150px] truncate">{file.name}</span>
                  <span className="text-muted-foreground">
                    ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                  <button
                    onClick={() => handleRemoveAttachment(index)}
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
            {/* Input file caché */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
            />

            {/* Bouton Paperclip */}
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
