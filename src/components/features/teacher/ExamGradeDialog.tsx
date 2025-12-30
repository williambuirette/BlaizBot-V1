"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

interface ExamGradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseName: string;
  currentGrade?: number | null;
  onSave: (grade: number, comment?: string) => Promise<void>;
}

export function ExamGradeDialog({
  open,
  onOpenChange,
  courseName,
  currentGrade,
  onSave,
}: ExamGradeDialogProps) {
  const [grade, setGrade] = useState<string>("");
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Réinitialiser le formulaire quand le dialog s'ouvre
  useEffect(() => {
    if (open) {
      setGrade(currentGrade?.toString() ?? "");
      setComment("");
      setError(null);
    }
  }, [open, currentGrade]);

  const handleSave = async () => {
    const numGrade = parseFloat(grade);

    // Validation
    if (isNaN(numGrade)) {
      setError("Veuillez entrer une note valide");
      return;
    }
    if (numGrade < 0 || numGrade > 6) {
      setError("La note doit être comprise entre 0 et 6");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await onSave(numGrade, comment || undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (!saving) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={saving ? undefined : onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Note d&apos;examen</DialogTitle>
          <DialogDescription>{courseName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Note */}
          <div className="space-y-2">
            <Label htmlFor="grade">Note (sur 6)</Label>
            <Input
              id="grade"
              type="number"
              min="0"
              max="6"
              step="0.5"
              value={grade}
              onChange={(e) => {
                setGrade(e.target.value);
                setError(null);
              }}
              placeholder="Ex: 4.5"
              disabled={saving}
            />
            <p className="text-xs text-muted-foreground">
              Système de notation suisse : 6 = Excellent, 4 = Suffisant, &lt;4 = Insuffisant
            </p>
          </div>

          {/* Commentaire */}
          <div className="space-y-2">
            <Label htmlFor="comment">Commentaire (optionnel)</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Remarques sur l'examen..."
              rows={3}
              disabled={saving}
            />
          </div>

          {/* Erreur */}
          {error && (
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 p-2 rounded">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={saving}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={saving || !grade}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
