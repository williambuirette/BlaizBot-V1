"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Brain, CheckCircle, Rocket, ThumbsUp, AlertCircle } from "lucide-react";

interface AIScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  score: {
    overall: number;
    comprehension: number;
    accuracy: number;
    autonomy: number;
    strengths: string[];
    weaknesses: string[];
    recommendation: string;
  };
  activityType: "QUIZ" | "EXERCISE" | "REVISION";
  activityTitle?: string;
}

export function AIScoreModal({
  isOpen,
  onClose,
  score,
  activityType,
  activityTitle,
}: AIScoreModalProps) {
  const getActivityLabel = () => {
    switch (activityType) {
      case "QUIZ":
        return "Quiz";
      case "EXERCISE":
        return "Exercice";
      case "REVISION":
        return "Révision";
      default:
        return "Activité";
    }
  };

  const getScoreColor = (value: number) => {
    if (value >= 80) return "text-green-600";
    if (value >= 60) return "text-orange-500";
    return "text-red-500";
  };

  const getScoreBadgeVariant = (value: number): "default" | "secondary" | "destructive" | "outline" => {
    if (value >= 80) return "default";
    if (value >= 60) return "secondary";
    return "destructive";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            🎉 {getActivityLabel()} terminé !
          </DialogTitle>
          {activityTitle && (
            <DialogDescription className="text-center text-base">
              {activityTitle}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Score global */}
          <Card className="p-6 text-center bg-gradient-to-br from-blue-50 to-indigo-50">
            <p className="text-sm text-muted-foreground mb-2">Ton score</p>
            <p className={`text-5xl font-bold ${getScoreColor(score.overall)}`}>
              {score.overall}/100
            </p>
          </Card>

          {/* 3 Critères IA */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-4 text-center">
              <Brain className="w-8 h-8 mx-auto mb-2 text-purple-500" />
              <p className="text-xs text-muted-foreground mb-1">Compréhension</p>
              <Badge variant={getScoreBadgeVariant(score.comprehension)} className="text-lg">
                {score.comprehension}%
              </Badge>
            </Card>

            <Card className="p-4 text-center">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <p className="text-xs text-muted-foreground mb-1">Précision</p>
              <Badge variant={getScoreBadgeVariant(score.accuracy)} className="text-lg">
                {score.accuracy}%
              </Badge>
            </Card>

            <Card className="p-4 text-center">
              <Rocket className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <p className="text-xs text-muted-foreground mb-1">Autonomie</p>
              <Badge variant={getScoreBadgeVariant(score.autonomy)} className="text-lg">
                {score.autonomy}%
              </Badge>
            </Card>
          </div>

          {/* Points forts */}
          {score.strengths.length > 0 && (
            <Card className="p-4 bg-green-50 border-green-200">
              <div className="flex items-start gap-2">
                <ThumbsUp className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-green-900 mb-2">Points forts :</p>
                  <ul className="space-y-1">
                    {score.strengths.map((strength, index) => (
                      <li key={index} className="text-sm text-green-800">
                        • {strength}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          )}

          {/* À améliorer */}
          {score.weaknesses.length > 0 && (
            <Card className="p-4 bg-orange-50 border-orange-200">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-orange-900 mb-2">À améliorer :</p>
                  <ul className="space-y-1">
                    {score.weaknesses.map((weakness, index) => (
                      <li key={index} className="text-sm text-orange-800">
                        • {weakness}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          )}

          {/* Recommandation */}
          {score.recommendation && (
            <Card className="p-4 bg-blue-50 border-blue-200">
              <p className="font-semibold text-blue-900 mb-2">🎯 Recommandation :</p>
              <p className="text-sm text-blue-800">{score.recommendation}</p>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onClose}>
              Voir détails
            </Button>
            <Button onClick={onClose}>
              Continuer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
