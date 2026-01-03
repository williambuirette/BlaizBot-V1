// Types pour MessageThread

export interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderRole?: 'STUDENT' | 'TEACHER' | 'ADMIN';
  createdAt: string;
  attachments?: { name: string; size: number; type: string }[] | null;
}

export interface Participant {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface CourseRef {
  id: string;
  title: string;
}

export interface MessageThreadProps {
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
  /** URL de l'API pour récupérer les messages */
  apiBaseUrl: string;
  /** Callback pour revenir à la liste (mobile) */
  onBack?: () => void;
  /** Callback pour envoyer un message */
  onSendMessage: (content: string) => Promise<void>;
  /** Callback pour marquer comme lu */
  onMarkAsRead?: () => void;
}
