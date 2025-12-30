"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, AlertTriangle, CheckCircle, ArrowRight } from "lucide-react";
import { toast } from "sonner";

interface GeminiInsightCardProps {
  classId: string;
  courseId: string; // On suppose qu'on analyse un cours spécifique pour cette classe
  className?: string;
}

interface AnalysisResult {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  actions: string[];
  createdAt?: string;
}

export function GeminiInsightCard({ classId, courseId, className }: GeminiInsightCardProps) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const response = await fetch(`/api/teacher/analytics/generate?classId=${classId}`);
        if (response.ok) {
          const data = await response.json();
          if (data) setAnalysis(data);
        }
      } catch (error) {
        console.error("Erreur chargement analyse:", error);
      }
    };

    if (classId) {
      fetchAnalysis();
    }
  }, [classId]);

  const handleGenerateAnalysis = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/teacher/analytics/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId, courseId }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'analyse");
      }

      const data = await response.json();
      setAnalysis(data);
      toast.success("Analyse IA générée avec succès !");
    } catch (error) {
      console.error(error);
      toast.error("Impossible de générer l'analyse.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={`border-indigo-100 bg-indigo-50/30 ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium flex items-center gap-2 text-indigo-900">
          <Sparkles className="h-5 w-5 text-indigo-600" />
          L&apos;Œil de BlaizBot
        </CardTitle>
        <Button 
          onClick={handleGenerateAnalysis} 
          disabled={loading}
          size="sm"
          variant={analysis ? "outline" : "default"}
          className={analysis ? "border-indigo-200 text-indigo-700 hover:bg-indigo-100" : "bg-indigo-600 hover:bg-indigo-700 text-white"}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyse en cours...
            </>
          ) : (
            analysis ? "Actualiser l'analyse" : "Lancer l'analyse"
          )}
        </Button>
      </CardHeader>
      <CardContent>
        {!analysis ? (
          <div className="text-sm text-indigo-700/80 italic">
            Cliquez pour analyser la progression de la classe et obtenir des recommandations personnalisées basées sur les ressources du cours.
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
            {analysis.createdAt && (
              <div className="text-xs text-indigo-400 text-right">
                Dernière mise à jour : {new Date(analysis.createdAt).toLocaleDateString()} à {new Date(analysis.createdAt).toLocaleTimeString()}
              </div>
            )}
            <div className="text-sm text-indigo-900 font-medium leading-relaxed">
              {analysis.summary}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/60 p-3 rounded-lg border border-indigo-100">
                <h4 className="text-xs font-semibold text-green-700 flex items-center gap-1 mb-2">
                  <CheckCircle className="h-3 w-3" /> POINTS FORTS
                </h4>
                <ul className="text-xs text-gray-700 space-y-1 list-disc pl-4">
                  {analysis.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-white/60 p-3 rounded-lg border border-indigo-100">
                <h4 className="text-xs font-semibold text-amber-700 flex items-center gap-1 mb-2">
                  <AlertTriangle className="h-3 w-3" /> POINTS DE VIGILANCE
                </h4>
                <ul className="text-xs text-gray-700 space-y-1 list-disc pl-4">
                  {analysis.weaknesses.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-white p-3 rounded-lg border border-indigo-200 shadow-sm">
              <h4 className="text-xs font-semibold text-indigo-800 mb-2 flex items-center gap-1">
                <ArrowRight className="h-3 w-3" /> ACTIONS RECOMMANDÉES
              </h4>
              <div className="flex flex-wrap gap-2">
                {analysis.actions.map((action, i) => (
                  <BadgeAction key={i} text={action} />
                ))}
              </div>
            </div>
            
            <div className="flex justify-end">
               <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleGenerateAnalysis}
                className="text-xs text-indigo-600 hover:text-indigo-800 h-auto p-0 hover:bg-transparent"
              >
                Actualiser l&apos;analyse
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function BadgeAction({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-200">
      {text}
    </span>
  );
}
