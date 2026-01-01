"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { AIScoreModal } from "./AIScoreModal";
import { LiveScoreBadge } from "./LiveScoreBadge";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  score?: {
    overall: number;
    comprehension: number;
    accuracy: number;
    autonomy: number;
  };
}

interface EvaluationResult {
  overallScore: number;
  comprehension: number;
  accuracy: number;
  autonomy: number;
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
}

/**
 * StudentAIChatPage - Interface de chat IA pour élève
 * - Chat interactif avec l'IA
 * - Badge de score en temps réel
 * - Modal de résultats après session terminée
 */
export function StudentAIChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentScore, setCurrentScore] = useState<EvaluationResult | null>(null);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [activityType, setActivityType] = useState<"QUIZ" | "EXERCISE" | "REVISION">("QUIZ");

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Simuler une réponse IA (remplacer par appel API réel)
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          sessionId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        const assistantMessage: Message = {
          role: "assistant",
          content: data.message,
          timestamp: new Date().toISOString(),
          score: data.score,
        };

        setMessages((prev) => [...prev, assistantMessage]);
        
        if (!sessionId && data.sessionId) {
          setSessionId(data.sessionId);
        }

        if (data.score) {
          setCurrentScore({
            overallScore: data.score.overall,
            comprehension: data.score.comprehension,
            accuracy: data.score.accuracy,
            autonomy: data.score.autonomy,
            strengths: [],
            weaknesses: [],
            recommendation: "",
          });
        }
      }
    } catch (error) {
      console.error("Erreur chat:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEndSession = async () => {
    if (!sessionId) return;

    try {
      // Appeler l'API d'évaluation
      const response = await fetch("/api/ai/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aiChatId: sessionId,
          activityType,
          courseId: "course-id-placeholder", // À récupérer du contexte
        }),
      });

      if (response.ok) {
        const evaluation = await response.json();
        
        setCurrentScore({
          overallScore: evaluation.score.overall,
          comprehension: evaluation.score.comprehension,
          accuracy: evaluation.score.accuracy,
          autonomy: evaluation.score.autonomy,
          strengths: evaluation.score.strengths,
          weaknesses: evaluation.score.weaknesses,
          recommendation: evaluation.score.recommendation,
        });
        
        setShowScoreModal(true);
      }
    } catch (error) {
      console.error("Erreur évaluation:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Assistant IA</h1>
          <p className="text-muted-foreground">
            Posez vos questions et obtenez de l&apos;aide personnalisée
          </p>
        </div>
        {currentScore && (
          <LiveScoreBadge
            overallScore={currentScore.overallScore}
            comprehension={currentScore.comprehension}
            accuracy={currentScore.accuracy}
            autonomy={currentScore.autonomy}
            size="lg"
          />
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Conversation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Zone de messages */}
          <div className="min-h-[400px] max-h-[500px] overflow-y-auto space-y-4 p-4 border rounded-lg bg-muted/10">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <Bot className="h-12 w-12 mb-4 opacity-50" />
                <p>Commencez une conversation avec l&apos;assistant IA</p>
                <p className="text-sm mt-2">
                  Demandez de l&apos;aide pour vos devoirs, révisez un cours ou faites un quiz
                </p>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-purple-600" />
                      </div>
                    </div>
                  )}
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    {msg.score && (
                      <div className="mt-2">
                        <LiveScoreBadge
                          overallScore={msg.score.overall}
                          comprehension={msg.score.comprehension}
                          accuracy={msg.score.accuracy}
                          autonomy={msg.score.autonomy}
                          size="sm"
                        />
                      </div>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Zone de saisie */}
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Tapez votre message..."
              disabled={loading}
            />
            <Button onClick={handleSend} disabled={loading || !input.trim()}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Bouton terminer session */}
          {messages.length > 0 && (
            <Button
              variant="outline"
              className="w-full"
              onClick={handleEndSession}
              disabled={!sessionId}
            >
              Terminer la session et voir mon score
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Modal de résultats */}
      {currentScore && (
        <AIScoreModal
          isOpen={showScoreModal}
          onClose={() => setShowScoreModal(false)}
          score={{
            overall: currentScore.overallScore,
            comprehension: currentScore.comprehension,
            accuracy: currentScore.accuracy,
            autonomy: currentScore.autonomy,
            strengths: currentScore.strengths,
            weaknesses: currentScore.weaknesses,
            recommendation: currentScore.recommendation,
          }}
          activityType={activityType}
          activityTitle="Session de révision"
        />
      )}
    </div>
  );
}
