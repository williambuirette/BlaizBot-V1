# Phase 7.11 - Tableau de Bord IA & Assistant Gemini

> **Objectif** : "Cockpit Pédagogique" avec analyse multimodale (Vidéos/PDFs) via Gemini.
> **Durée estimée** : 6-8h
> **Pré-requis** : Phase 7.8 (Ressources & Données)

---

## 🧠 Vision : L'Assistant Pédagogique Multimodal

Nous remplaçons l'approche classique (OpenAI) par **Gemini** pour ses capacités natives à :
1.  **Visionner les vidéos YouTube** du cours (sans transcription tierce).
2.  **Lire les PDFs** et images des ressources.
3.  **Comprendre le contexte complet** du cours pour :
    *   Générer des quiz pertinents.
    *   Expliquer les concepts aux élèves (Tuteur).
    *   Analyser la progression de la classe pour le prof.

### Maquette Conceptuelle

```
  Tableau de Bord : Mathématiques 3A                           
---------------------------------------------------------------
 [ KPI 1 ]       [ KPI 2 ]       [ KPI 3 ]       [ KPI 4 ]       
  Présence       Devoirs       À risque      Moyenne      
    95%             18/20           3 élèves        14.5/20      
---------------------------------------------------------------
                                                                 
  Gemini Insights (Analyse basée sur 3 vidéos + 2 PDFs)        
  
  "J'ai analysé la vidéo 'Théorème de Thalès' et les devoirs.  
    Points acquis : Calcul des longueurs (80% réussite).     
    Point de blocage : La condition de parallélisme est      
      souvent oubliée (voir minute 4:30 de la vidéo).          
                                                              
    Suggestion : Créer un mini-quiz ciblé sur ce point."     
                                                              
  [Générer le Quiz] [Voir les élèves en difficulté]            
  
                                                                 
---------------------------------------------------------------
```

---

## 🏗️ Architecture Technique (Gemini)

### 1. Modèle de Données (Prisma)

On stocke les analyses et les embeddings (si besoin, mais Gemini a une grande fenêtre contextuelle).

```prisma
// Dans schema.prisma

model ClassAnalysis {
  id          String   @id @default(cuid())
  classId     String
  class       Class    @relation(fields: [classId], references: [id], onDelete: Cascade)
  
  // Contexte utilisé
  resourceIds String[] // IDs des ressources analysées (Vidéos, PDFs)
  
  // Contenu généré
  summary     String   @db.Text
  strengths   String[]
  weaknesses  String[]
  actions     String[]
  
  createdAt   DateTime @default(now())
  
  @@index([classId])
}
```

### 2. Service Gemini (`src/lib/ai/gemini.ts`)

Utilisation du SDK `@google/generative-ai`.

- **Ingestion** :
  - YouTube : Extraire l'ID vidéo → Gemini (via URL ou frames si nécessaire, ou transcript si API limitée). *Note: Gemini 1.5 Pro peut traiter la vidéo/audio nativement si uploadée via File API, ou via transcript pour le texte.*
  - PDF : Convertir en texte/images → Gemini.
- **Prompting** :
  - "Voici le contenu du cours (Vidéos + PDFs). Voici les résultats des élèves. Analyse les écarts."

---

## 📋 Plan de Développement

### Bloc 1 : Configuration Gemini (7.11.1)
- Configurer `GoogleGenerativeAI` client.
- Créer `GeminiService` avec méthodes :
  - `analyzeCourseContent(resources: Resource[])`
  - `generateQuizFromVideo(youtubeUrl: string)`
  - `analyzeStudentProgress(progress: StudentProgress[])`

### Bloc 2 : Backend Analytics (7.11.2)

**Prompt 7.11.2 — Backend Analytics & API**

```typescript
// Créer src/lib/analytics.ts
// Service pour calculer les statistiques brutes avant envoi à l'IA

export const analyticsService = {
  calculateClassStats(progress: any[]) {
    // Calculer moyenne, taux de complétion, distribution
    // Identifier les élèves à risque (< 10/20)
    return { average: 0, completionRate: 0, atRiskCount: 0 };
  }
};

// Mettre à jour src/app/api/teacher/analytics/generate/route.ts
// 1. Utiliser analyticsService pour pré-calculer les stats
// 2. Enrichir le prompt Gemini avec ces stats calculées
// 3. Sauvegarder dans ClassAnalysis
```

### Bloc 3 : UI Dashboard (7.11.3)

**Prompt 7.11.3 — UI Dashboard & Intégration**

```tsx
// Créer src/components/features/dashboard/GeminiInsightCard.tsx
// Carte affichant l'analyse IA

// Props: { classId: string, courseId: string }
// State: analysis (ClassAnalysis | null), loading, error
// Effect: Fetch analysis on mount
// Render:
// - Header: "L'Œil de BlaizBot" (Icone Gemini)
// - Content: Summary, Strengths (Green), Weaknesses (Red), Actions (Blue)
// - Footer: Bouton "Actualiser l'analyse"

// Intégrer dans src/app/(dashboard)/teacher/classes/[id]/page.tsx
```

---

## 🧠 Prompt Optimal pour Gemini (Analyse)

```text
RÔLE:
Tu es un assistant pédagogique expert utilisant Gemini 1.5 Pro.

CONTEXTE DU COURS:
[Ressource 1: Vidéo YouTube "Les vecteurs"]
[Ressource 2: PDF "Exercices corrigés"]

DONNÉES ÉLÈVES:
- Moyenne classe : 11/20
- Erreur fréquente Q3 : Confusion sens/direction

TÂCHE:
1. Identifie dans les ressources le passage qui explique l'erreur fréquente.
2. Suggère une explication alternative pour les élèves.
3. Propose 3 actions pour le professeur.
```
