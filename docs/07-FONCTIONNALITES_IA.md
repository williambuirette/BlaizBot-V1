# 07 - Fonctionnalités IA

> **Objectif** : Spécifier toutes les intégrations IA (chat, RAG, génération)
> **Sources** : `blaizbot-wireframe/js/modules/ai-assistant.js`, `lab.js`, `chat.js`

---

## 🎯 Vue d'ensemble

BlaizBot intègre 3 types de fonctionnalités IA :

| Type | Module | Usage |
| :--- | :--- | :--- |
| **Chat conversationnel** | Assistant IA | Aide aux devoirs, révisions |
| **RAG (Retrieval)** | Base de connaissances | Réponses basées sur les cours |
| **Génération** | Blaiz'Lab | Fiches, quiz, contenus |

---

## 🤖 Assistant IA (Élève)

### Comportement attendu

L'assistant Blaiz'bot aide l'élève dans ses devoirs et révisions :

1. **Contexte** : Se base sur la matière et le thème sélectionnés
2. **Sources** : Utilise les documents uploadés (RAG)
3. **Pédagogie** : Répond de manière adaptée au niveau scolaire
4. **Citations** : Cite les sources utilisées pour la réponse

### Flux de données

```
Élève → Question + (Matière + Thème + Documents)
           ↓
    [Embeddings des documents]
           ↓
    [Recherche vectorielle]
           ↓
    [Contexte pertinent]
           ↓
    [Prompt système + Contexte + Question]
           ↓
    OpenAI GPT-4o-mini
           ↓
    Réponse + Sources citées
```

### API

```typescript
// POST /api/ai/chat
interface ChatRequest {
  message: string;
  context: {
    subjectId: string;      // Ex: "maths"
    themeId?: string;       // Ex: "fractions"
    documentIds?: string[]; // Documents sources
  };
  conversationId?: string;  // Pour l'historique
}

interface ChatResponse {
  message: string;
  sources: {
    documentId: string;
    documentName: string;
    excerpt: string;
    relevance: number; // 0-1
  }[];
  conversationId: string;
}
```

### Prompt système (Élève)

```
Tu es Blaiz'bot, un assistant pédagogique pour les élèves de collège.

RÈGLES :
1. Réponds de manière claire et adaptée au niveau collège
2. Utilise des exemples concrets pour expliquer
3. Si tu utilises des informations des documents fournis, cite la source
4. Si tu ne sais pas, dis-le clairement
5. Encourage l'élève à réfléchir plutôt que donner directement la réponse
6. Utilise le format Markdown pour structurer tes réponses

CONTEXTE ACTUEL :
- Matière : {subject}
- Thème : {theme}
- Documents disponibles : {documents}

HISTORIQUE DE CONVERSATION :
{history}
```

---

## 🔬 Blaiz'Lab (Génération)

### Fonctionnalités

| Action | Description | Input | Output |
| :--- | :--- | :--- | :--- |
| **Résumer** | Synthèse d'un document | Document PDF/texte | Résumé structuré |
| **Fiche révision** | Fiche mémo | Thème + Sources | Fiche formatée |
| **Quiz** | Questions de révision | Thème + Sources | Quiz interactif |
| **Plan** | Structure de cours/exposé | Sujet | Plan détaillé |
| **Expliquer** | Simplification | Concept complexe | Explication claire |

### API Génération

```typescript
// POST /api/ai/generate
interface GenerateRequest {
  type: 'summary' | 'revision' | 'quiz' | 'plan' | 'explain';
  input: {
    text?: string;          // Texte brut
    documentIds?: string[]; // Documents sources
    topic?: string;         // Sujet/thème
  };
  options?: {
    length?: 'short' | 'medium' | 'long';
    format?: 'markdown' | 'html' | 'json';
    level?: 'college' | 'lycee';
  };
}

interface GenerateResponse {
  content: string;
  format: string;
  metadata: {
    wordCount: number;
    sources: string[];
    generatedAt: string;
  };
}
```

### Prompts de génération

#### Résumé

```
Résume le document suivant en {length} points clés.
Format : liste à puces avec titres.
Niveau : {level}

Document :
{content}
```

#### Fiche révision

```
Crée une fiche de révision sur "{topic}" à partir des sources.

Structure attendue :
1. ESSENTIEL (3-5 points clés)
2. DÉFINITIONS (termes importants)
3. EXEMPLES (concrets, mémorisables)
4. À RETENIR (formules, dates, noms)
5. PIÈGES À ÉVITER (erreurs fréquentes)

Sources :
{documents}
```

#### Quiz

```
Génère un quiz de {count} questions sur "{topic}".

Format JSON :
{
  "questions": [
    {
      "question": "...",
      "type": "qcm" | "vrai_faux" | "reponse_courte",
      "options": ["A", "B", "C", "D"], // si QCM
      "answer": "...",
      "explanation": "..."
    }
  ]
}

Niveau de difficulté : {level}
Sources : {documents}
```

---

## 📚 RAG (Retrieval-Augmented Generation)

### Architecture

```
Documents (PDF, DOCX, MD)
        ↓
[Parser + Chunking]
        ↓
[Embeddings OpenAI]
        ↓
[Stockage pgvector (Vercel Postgres)]
        ↓
Recherche vectorielle
        ↓
Contexte pour LLM
```

### Configuration embeddings

```typescript
// src/lib/ai/embeddings.ts
const embeddingsConfig = {
  model: 'text-embedding-3-small', // OpenAI
  dimensions: 1536,
  chunkSize: 500,    // tokens par chunk
  chunkOverlap: 50,  // chevauchement
};
```

### Table PostgreSQL (pgvector)

```sql
CREATE TABLE document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding VECTOR(1536),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour recherche vectorielle
CREATE INDEX ON document_chunks 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

### Fonction de recherche

```typescript
// src/lib/ai/search.ts
async function searchDocuments(
  query: string,
  options: {
    subjectId?: string;
    themeId?: string;
    limit?: number;
    threshold?: number;
  }
): Promise<SearchResult[]> {
  // 1. Embed la query
  const queryEmbedding = await embedText(query);
  
  // 2. Recherche vectorielle
  const { data } = await prisma.\('match_documents', {
    query_embedding: queryEmbedding,
    match_threshold: options.threshold || 0.7,
    match_count: options.limit || 5,
    filter_subject: options.subjectId,
    filter_theme: options.themeId,
  });
  
  return data;
}
```

---

## 🎓 IA Professeur

### Fonctionnalités

| Action | Description |
| :--- | :--- |
| **Analyse progression** | Détecte les élèves en difficulté |
| **Suggestions pédagogiques** | Recommandations personnalisées |
| **Génération exercices** | Créer des exercices adaptés |
| **Correction assistée** | Aide à l'évaluation |

### Prompt analyse classe

```
Tu es un assistant pédagogique pour enseignants.

Analyse les données de progression de la classe et fournis :
1. ALERTES : Élèves en difficulté (progression < 50%)
2. TENDANCES : Points forts/faibles de la classe
3. RECOMMANDATIONS : Actions pédagogiques suggérées

Données classe :
{classData}

Format : Liste structurée avec justifications.
```

---

## 🛡️ Sécurité & Limites

### Rate limiting

```typescript
const rateLimits = {
  student: {
    chatMessagesPerDay: 100,
    generationsPerDay: 20,
    documentsPerMonth: 50,
  },
  teacher: {
    chatMessagesPerDay: 200,
    generationsPerDay: 50,
    documentsPerMonth: 200,
  },
};
```

### Modération

```typescript
// POST /api/ai/chat - Middleware
async function moderateInput(message: string): Promise<boolean> {
  const response = await openai.moderations.create({
    input: message,
  });
  
  return !response.results[0].flagged;
}
```

### Filtrage contenu

- Pas de réponses sur sujets non éducatifs
- Pas de génération de code malveillant
- Pas de contenu inapproprié pour mineurs
- Logs des conversations pour audit

---

## 📦 Dépendances

```json
{
  "ai": "^4.0.0",           // Vercel AI SDK
  "@ai-sdk/openai": "^1.0.0",
  "openai": "^4.0.0",       // Pour embeddings
  "pdf-parse": "^1.1.1",    // Parser PDF
  "mammoth": "^1.6.0"       // Parser DOCX
}
```

---

## ✅ Checklist

- [ ] Vercel AI SDK configuré
- [ ] Clé OpenAI dans `.env`
- [ ] Table `document_chunks` créée avec pgvector
- [ ] Fonction RPC `match_documents` créée
- [ ] Rate limiting implémenté
- [ ] Modération activée
- [ ] Prompts testés et optimisés
- [ ] Streaming activé pour le chat
