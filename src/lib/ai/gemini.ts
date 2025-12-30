import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import { Resource, StudentProgress, CourseAssignment, User } from "@prisma/client";

// Interface pour le retour de l'analyse
export interface AIAnalysisResult {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  actions: string[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: GenerativeModel | null = null;

  private getModel(): GenerativeModel {
    if (this.model) return this.model;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined in environment variables");
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    return this.model;
  }

  /**
   * Helper pour générer du JSON structuré
   */
  async generateJson<T>(prompt: string): Promise<T> {
    try {
      const model = this.getModel();
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      
      // Nettoyage du markdown JSON
      const jsonString = text.replace(/```json\n|\n```/g, "").replace(/```/g, "").trim();
      
      return JSON.parse(jsonString) as T;
    } catch (error) {
      console.error("Erreur Gemini generateJson:", error);
      throw error;
    }
  }

  /**
   * Génère un quiz à partir d'une URL de vidéo
   */
  async generateQuizFromVideo(videoUrl: string, topic: string, count: number = 5): Promise<QuizQuestion[]> {
    const prompt = `
      RÔLE:
      Tu es un expert pédagogique.
      
      TÂCHE:
      Génère un quiz de ${count} questions à choix multiples basé sur la vidéo suivante.
      Si tu ne peux pas visionner la vidéo directement, base-toi sur le sujet et le titre probables.
      
      VIDÉO: ${videoUrl}
      SUJET: ${topic}
      
      FORMAT JSON ATTENDU:
      [
        {
          "question": "Question ?",
          "options": ["A", "B", "C", "D"],
          "correctAnswer": 0, // Index de la bonne réponse
          "explanation": "Pourquoi c'est la bonne réponse"
        }
      ]
    `;
    
    return this.generateJson<QuizQuestion[]>(prompt);
  }

  /**
   * Analyse le contenu du cours et la progression des élèves
   */
  async analyzeClassProgress(
    resources: Resource[],
    progressData: (StudentProgress & { student: User; assignment: CourseAssignment })[],
    statsContext?: string
  ): Promise<AIAnalysisResult> {
    try {
      // 1. Préparation du contexte des ressources
      const resourcesContext = resources
        .map((r) => `- [${r.type}] ${r.title}: ${r.description || "Pas de description"} (${r.url || "Fichier local"})`)
        .join("\n");

      // 2. Préparation du contexte des élèves
      const progressContext = progressData
        .map(
          (p) =>
            `- Élève: ${p.student.firstName} ${p.student.lastName}, Devoir: ${p.assignment.title}, Score: ${p.score}/100, Statut: ${p.status}`
        )
        .join("\n");

      // 3. Construction du prompt
      const prompt = `
        RÔLE:
        Tu es un assistant pédagogique expert utilisant Gemini 1.5 Pro.

        CONTEXTE DU COURS (Ressources disponibles):
        ${resourcesContext}

        STATISTIQUES GLOBALES:
        ${statsContext || "Non disponibles"}

        DÉTAIL PROGRESSION DES ÉLÈVES:
        ${progressContext}

        TÂCHE:
        Analyse ces données pour fournir une synthèse pédagogique.
        
        FORMAT DE RÉPONSE ATTENDU (JSON uniquement):
        {
          "summary": "Résumé global de la situation de la classe (max 50 mots)",
          "strengths": ["Point fort 1", "Point fort 2"],
          "weaknesses": ["Point faible 1", "Point faible 2"],
          "actions": ["Action concrète 1", "Action concrète 2", "Action concrète 3"]
        }
      `;

      return await this.generateJson<AIAnalysisResult>(prompt);
    } catch (error) {
      console.error("Erreur lors de l'analyse Gemini:", error);
      // Fallback en cas d'erreur
      return {
        summary: "Impossible de générer l'analyse pour le moment.",
        strengths: [],
        weaknesses: [],
        actions: ["Vérifier la configuration de l'IA"],
      };
    }
  }

  }

export const geminiService = new GeminiService();
