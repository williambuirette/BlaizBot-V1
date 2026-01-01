"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, Lightbulb, MessageCircle, Loader2, TrendingUp } from "lucide-react";

interface AIAnalysisPanelProps {
  courseId: string;
  themeId?: string;
}

interface FrequentQuestion {
  question: string;
  count: number;
}

interface AISuggestion {
  type: "quiz" | "exercise" | "video" | "other";
  title: string;
  description: string;
}

interface AIAnalysisData {
  frequentQuestions: FrequentQuestion[];
  suggestions: AISuggestion[];
}

/**
 * AIAnalysisPanel - Analyse IA d'un thème/cours
 * - Questions fréquentes des élèves
 * - Suggestions pédagogiques automatiques
 */
export function AIAnalysisPanel({ courseId, themeId }: AIAnalysisPanelProps) {
  const [analysis, setAnalysis] = useState<AIAnalysisData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const url = themeId
          ? `/api/teacher/courses/${courseId}/themes/${themeId}/ai-analysis`
          : `/api/teacher/courses/${courseId}/ai-analysis`;
        
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setAnalysis(data);
        }
      } catch (error) {
        console.error("Erreur fetch AI analysis:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [courseId, themeId]);

  if (loading) {
    return (
      <Card className="border-indigo-200 bg-indigo-50/30">
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
        </CardContent>
      </Card>
    );
  }

  if (!analysis || (analysis.frequentQuestions.length === 0 && analysis.suggestions.length === 0)) {
    return (
      <Card className="border-indigo-200 bg-indigo-50/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-2 text-indigo-600">
            <Bot className="h-5 w-5" />
            <span className="text-sm">
              Pas assez de données pour générer une analyse IA
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getSuggestionIcon = (type: AISuggestion["type"]) => {
    switch (type) {
      case "quiz": return "📝";
      case "exercise": return "💻";
      case "video": return "📹";
      default: return "💡";
    }
  };

  return (
    <Card className="border-indigo-200 bg-indigo-50/30">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-indigo-700 flex items-center gap-2">
          <Bot className="h-4 w-4" />
          🤖 ANALYSE IA
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Questions fréquentes */}
        {analysis.frequentQuestions.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-indigo-900">
              <MessageCircle className="h-4 w-4" />
              Questions fréquentes (top 3) :
            </div>
            <div className="space-y-2">
              {analysis.frequentQuestions.slice(0, 3).map((fq, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg bg-white border border-indigo-100 flex items-start justify-between gap-2"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-indigo-600 font-medium">{index + 1}.</span>
                    <span className="text-sm text-gray-700">&quot;{fq.question}&quot;</span>
                  </div>
                  <Badge variant="secondary" className="shrink-0 text-xs">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {fq.count} fois
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suggestions IA */}
        {analysis.suggestions.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-indigo-900">
              <Lightbulb className="h-4 w-4" />
              💡 Suggestions IA :
            </div>
            <div className="space-y-2">
              {analysis.suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg bg-white border border-indigo-100"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-lg">{getSuggestionIcon(suggestion.type)}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{suggestion.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{suggestion.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
