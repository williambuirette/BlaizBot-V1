'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, MessageSquare } from 'lucide-react';
import {
  ConversationsList,
  Conversation,
} from '@/components/features/messages/ConversationsList';
import { MessageThread } from '@/components/features/shared/MessageThread';
import { NewConversationDialog } from '@/components/features/messages/NewConversationDialog';

export default function TeacherMessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string>('');

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/teacher/messages');
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error('Erreur fetch conversations:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch current user
  const fetchCurrentUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/session');
      if (res.ok) {
        const data = await res.json();
        setCurrentUserId(data?.user?.id || '');
      }
    } catch (error) {
      console.error('Erreur fetch session:', error);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
    fetchCurrentUser();
  }, [fetchConversations, fetchCurrentUser]);

  // Send message in existing conversation
  const handleSendMessage = async (content: string) => {
    if (!selectedConversation) return;

    const res = await fetch('/api/teacher/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversationId: selectedConversation.id,
        receiverId: selectedConversation.participants[0]?.id,
        content,
      }),
    });

    if (!res.ok) {
      throw new Error('Erreur envoi message');
    }

    // Refresh conversations to update lastMessage
    fetchConversations();
  };

  const getConversationTitle = (conv: Conversation) => {
    if (conv.topicName) return conv.topicName;
    if (conv.participants.length === 1 && conv.participants[0]) {
      const p = conv.participants[0];
      return `${p.firstName} ${p.lastName}`;
    }
    return conv.participants.map((p) => p.firstName).join(', ');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Messagerie</h1>
          <p className="text-sm text-muted-foreground">
            Communiquez avec vos élèves
          </p>
        </div>
        {/* Utilisation du nouveau composant NewConversationDialog */}
        <NewConversationDialog onConversationCreated={fetchConversations} />
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Conversations list */}
        <div className={selectedConversation ? 'hidden md:block' : ''}>
          <ConversationsList
            conversations={conversations}
            selectedId={selectedConversation?.id || null}
            onSelect={setSelectedConversation}
            currentUserId={currentUserId}
          />
        </div>

        {/* Message thread */}
        <div className="md:col-span-2">
          {selectedConversation ? (
            <MessageThread
              conversationId={selectedConversation.id}
              conversationTitle={getConversationTitle(selectedConversation)}
              participants={selectedConversation.participants}
              subject={selectedConversation.subject}
              currentUserId={currentUserId}
              apiBaseUrl="/api/teacher/messages"
              onBack={() => setSelectedConversation(null)}
              onSendMessage={handleSendMessage}
            />
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium">Sélectionnez une conversation</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Choisissez une conversation dans la liste ou démarrez-en une nouvelle
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
