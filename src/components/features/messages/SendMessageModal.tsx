"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SendMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  studentName: string;
  studentEmail: string;
}

/**
 * SendMessageModal - Modal pour envoyer un message à un élève
 * Utilise le système de messagerie interne de l'application
 */
export function SendMessageModal({
  isOpen,
  onClose,
  studentId,
  studentName,
  studentEmail,
}: SendMessageModalProps) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }

    setSending(true);

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId: studentId,
          subject,
          content: message,
          type: "INDIVIDUAL",
        }),
      });

      if (response.ok) {
        toast({
          title: "Message envoyé",
          description: `Votre message a été envoyé à ${studentName}`,
        });
        setSubject("");
        setMessage("");
        onClose();
      } else {
        throw new Error("Erreur lors de l'envoi");
      }
    } catch (error) {
      console.error("Erreur envoi message:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Envoyer un message</DialogTitle>
          <DialogDescription>
            Message destiné à {studentName} ({studentEmail})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Objet</Label>
            <Input
              id="subject"
              placeholder="Ex: Suivi du cours de mathématiques"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={sending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Écrivez votre message ici..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={8}
              disabled={sending}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {message.length} caractères
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={sending}>
            Annuler
          </Button>
          <Button onClick={handleSend} disabled={sending || !subject.trim() || !message.trim()}>
            {sending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Envoi...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Envoyer
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
