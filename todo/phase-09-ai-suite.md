# 🤖 Phase 9 — Intégration IA (Suite)

> **Suite de** : [phase-09-ai.md](phase-09-ai.md)
> **Étapes** : 9.4 → 9.7 (RAG, Chat Contextuel, Quiz, Fiches)

---

## 📋 Étape 9.4 — RAG Setup

### 🎯 Objectif
Permettre à l'IA de répondre avec le contenu des cours (Retrieval-Augmented Generation).

### 📝 Comment
Stocker les embeddings des documents dans Vercel Postgres avec pgvector, puis chercher les chunks similaires.

### 🔧 Par quel moyen
- Extension pgvector dans Vercel Postgres
- Embeddings OpenAI (text-embedding-3-small)
- Recherche vectorielle cosine similarity

| # | Tâche | Fichier | Validation |
|:--|:------|:--------|:-----------|
| 9.4.1 | pgvector | Activer extension (migration Prisma) | SQL exécuté |
| 9.4.2 | Migration | Ajouter table `document_chunks` | Migration Prisma |
| 9.4.3 | Embed lib | `src/lib/ai/embeddings.ts` | < 80 lignes |
| 9.4.4 | Chunking | Fonction découpage texte | Chunks créés |
| 9.4.5 | Search | `src/lib/ai/rag.ts` | < 100 lignes |
| 9.4.6 | API | `POST /api/ai/embed` | Route embed document |
| 9.4.7 | Test | Embed un doc, chercher, résultat | Résultat trouvé |

### 💡 INSTRUCTION 9.4 (RAG Setup)

```markdown
## Contexte
Tu mets en place le RAG pour que l'IA cite les cours dans ses réponses.

## Ta mission
1. Activer pgvector (Dashboard Vercel > SQL Editor) :
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

2. Migration Prisma pour `document_chunks` :
   - id, documentId, content, embedding (Vector 1536), metadata, createdAt
   - Index IVFFLAT pour recherche rapide

3. `src/lib/ai/embeddings.ts` :
   - `generateEmbedding(text)` : retourne vector 1536
   - `chunkText(text, chunkSize, overlap)` : découpe en morceaux
   - Modèle : text-embedding-3-small

4. `src/lib/ai/rag.ts` :
   - `embedDocument(documentId)` : embed tous les chunks d'un doc
   - `searchSimilar(query, options)` : cherche chunks similaires
   - Options : subjectId, limit, threshold

5. `POST /api/ai/embed` :
   - Body : { documentId }
   - Récupère le doc, chunk, embed, stocke

## Schema SQL pour pgvector
CREATE TABLE document_chunks (
  id UUID PRIMARY KEY,
  document_id UUID REFERENCES documents(id),
  content TEXT NOT NULL,
  embedding VECTOR(1536),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON document_chunks 
USING ivfflat (embedding vector_cosine_ops);

## Code de référence
Voir [phase-09-code-suite.md](phase-09-code-suite.md) section 4
```

---

## 📋 Étape 9.5 — Chat avec Contexte Cours

### 🎯 Objectif
L'IA utilise le contenu des cours pour répondre et cite ses sources.

### 📝 Comment
Récupérer les chunks pertinents via RAG et les injecter dans le prompt.

### 🔧 Par quel moyen
- Embed la question utilisateur
- Chercher chunks similaires
- Injecter dans system prompt
- Afficher les sources citées

| # | Tâche | Fichier | Validation |
|:--|:------|:--------|:-----------|
| 9.5.1 | Param | Modifier chat API pour `courseId` | Param ajouté |
| 9.5.2 | RAG | Chercher chunks du cours | Top 3-5 chunks |
| 9.5.3 | Inject | Injecter contexte dans prompt | Prompt enrichi |
| 9.5.4 | Citation | IA cite "D'après le chapitre X..." | Citation visible |
| 9.5.5 | Sources UI | Afficher sources utilisées | Liste sources |
| 9.5.6 | Test | Question sur un cours → réponse contextuelle | Réponse pertinente |

### 💡 INSTRUCTION 9.5 (Chat Contextuel)

```markdown
## Contexte
L'élève veut des réponses basées sur son cours, pas des infos génériques.

## Ta mission
1. Modifier `POST /api/ai/chat` :
   - Accepter `courseId` optionnel dans le body
   - Si courseId fourni : activer le mode RAG

2. Flux RAG :
   a. Embed la question de l'utilisateur
   b. Chercher les 3-5 chunks les plus similaires (threshold > 0.7)
   c. Construire un contexte avec les chunks
   d. Injecter dans le system prompt

3. System prompt avec contexte :
   ```
   Tu es Blaiz'bot. Réponds en utilisant le contexte suivant.
   Si l'info n'est pas dans le contexte, dis-le clairement.
   Cite tes sources : "D'après le cours sur [sujet]..."

   CONTEXTE :
   {chunks}
   ```

4. Réponse avec sources :
   - L'IA cite les sources dans sa réponse
   - Optionnel : retourner la liste des sources utilisées

## Interface Sources
interface ChatWithSourcesResponse {
  message: string;
  sources: { chunkId: string; excerpt: string; relevance: number }[];
}

## Code de référence
Voir [phase-09-code-suite.md](phase-09-code-suite.md) section 5
```

---

## 📋 Étape 9.6 — Génération Quiz

### 🎯 Objectif
Générer des quiz interactifs à partir du contenu d'un cours.

### 📝 Comment
Prompt structuré qui retourne du JSON, parser et afficher.

### 🔧 Par quel moyen
- Prompt avec format JSON strict
- Parser la réponse
- Composant `QuizViewer` interactif

| # | Tâche | Fichier | Validation |
|:--|:------|:--------|:-----------|
| 9.6.1 | Lib | `src/lib/ai/quiz.ts` | < 120 lignes |
| 9.6.2 | Prompt | Générer 5 QCM format JSON | Prompt défini |
| 9.6.3 | API | `POST /api/ai/quiz` | Route génération |
| 9.6.4 | Parser | Parser JSON de la réponse | Quiz typé |
| 9.6.5 | Viewer | `QuizViewer.tsx` | < 200 lignes |
| 9.6.6 | Play | Questions, options, validation | Quiz jouable |
| 9.6.7 | Score | Score final affiché | X/5 correct |
| 9.6.8 | Bouton | Bouton "Générer quiz" page cours | Bouton visible |

### 💡 INSTRUCTION 9.6 (Génération Quiz)

```markdown
## Contexte
L'élève veut tester ses connaissances avec un quiz généré par l'IA.

## Ta mission
1. `src/lib/ai/quiz.ts` :
   - `generateQuiz(content, options)` : génère un quiz
   - Options : { count: 5, level: 'college' | 'lycee' }
   - Retourne un objet Quiz typé

2. Prompt de génération :
   ```
   Génère un quiz de {count} questions sur le contenu suivant.
   
   FORMAT JSON STRICT (pas de texte avant/après) :
   {
     "questions": [
       {
         "question": "...",
         "options": ["A", "B", "C", "D"],
         "correctIndex": 0,
         "explanation": "..."
       }
     ]
   }
   
   Contenu :
   {content}
   ```

3. `POST /api/ai/quiz` :
   - Body : { courseId } ou { content }
   - Retourne le Quiz parsé

4. `QuizViewer.tsx` :
   - Affiche une question à la fois
   - 4 options cliquables
   - Feedback immédiat (correct/incorrect)
   - Explication après réponse
   - Score final

## Type Quiz
interface Quiz {
  questions: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}

## Code de référence
Voir [phase-09-code-suite.md](phase-09-code-suite.md) section 6
```

---

## 📋 Étape 9.7 — Génération Fiches Révision

### 🎯 Objectif
Générer des fiches de révision structurées à partir d'un cours.

### 📝 Comment
Prompt structuré + sauvegarde en BDD pour la page "Mes Révisions".

### 🔧 Par quel moyen
- Prompt avec structure imposée
- Sauvegarder en table Revision
- Afficher dans la liste des révisions

| # | Tâche | Fichier | Validation |
|:--|:------|:--------|:-----------|
| 9.7.1 | Lib | `src/lib/ai/revision.ts` | < 100 lignes |
| 9.7.2 | Prompt | Structure : Essentiel, Définitions, Exemples | Prompt défini |
| 9.7.3 | API | `POST /api/ai/revision` | Route génération |
| 9.7.4 | Save | Sauvegarder fiche en BDD | Fiche créée |
| 9.7.5 | Bouton | Bouton "Générer fiche" page cours | Bouton visible |
| 9.7.6 | Redirect | Rediriger vers "Mes Révisions" | Fiche visible |

### 💡 INSTRUCTION 9.7 (Génération Fiches)

```markdown
## Contexte
L'élève veut une fiche de révision synthétique d'un cours.

## Ta mission
1. `src/lib/ai/revision.ts` :
   - `generateRevisionSheet(content, topic)` : génère une fiche
   - Retourne du Markdown structuré

2. Prompt de génération :
   ```
   Crée une fiche de révision sur "{topic}".
   
   STRUCTURE OBLIGATOIRE :
   ## 🎯 ESSENTIEL (3-5 points clés)
   ## 📖 DÉFINITIONS (termes importants)
   ## 💡 EXEMPLES (concrets, mémorisables)
   ## ⚠️ PIÈGES À ÉVITER (erreurs fréquentes)
   ## 🔑 À RETENIR (formules, dates clés)
   
   Contenu source :
   {content}
   ```

3. `POST /api/ai/revision` :
   - Body : { courseId, title }
   - Générer la fiche
   - Sauvegarder dans table Revision
   - Retourner la fiche créée

4. UX :
   - Bouton "Générer fiche révision" dans détail cours
   - Loading pendant génération
   - Toast succès + redirect vers "Mes Révisions"

## Code de référence
Voir [phase-09-code-suite.md](phase-09-code-suite.md) section 7
```

---

### 🧪 TEST CHECKPOINT 9.A — Validation IA complète

> ⚠️ **OBLIGATOIRE** : IA est le coeur de l'app

| Test | Commande | Résultat attendu |
|:-----|:---------|:-----------------|
| Build | `npm run build` | ✅ No errors |
| Lint | `npm run lint` | ✅ No warnings |
| TypeScript | `npx tsc --noEmit` | ✅ Clean |

**Tests IA fonctionnels** :
- [ ] Chat basique → réponse streaming visible
- [ ] Mode "hint" → indice sans réponse complète
- [ ] Mode "explain" → explication détaillée
- [ ] RAG → IA cite le contenu des cours
- [ ] Quiz → génération de 5 questions
- [ ] Quiz → réponses et score fonctionnent
- [ ] Fiche révision → générée et sauvegardée

**Tests d'erreur** :
- [ ] Clé OpenAI invalide → message d'erreur propre
- [ ] Rate limit → message retry
- [ ] Timeout → ne crash pas

**Tests performance** :
- [ ] Réponse chat < 3s pour premier token
- [ ] Quiz généré < 10s
- [ ] Pas de memory leak (vérifier DevTools)

---

### 🔄 REFACTOR CHECKPOINT 9.B — Vérification standards

> 📏 **Règle** : Aucun fichier > 350 lignes

```powershell
# Vérifier tous les fichiers IA
Get-ChildItem -Path src/lib/ai,src/app/api/ai -Recurse -Include *.ts | `
  ForEach-Object { $lines = (Get-Content $_).Count; if($lines -gt 350) { "$($_.Name): $lines lignes" } }
```

**Organisation IA** :
- [ ] `lib/ai/` structure claire (chat.ts, quiz.ts, revision.ts, rag.ts)
- [ ] Prompts dans fichiers séparés ou constants
- [ ] Types IA dans `types/ai.ts`

**Sécurité IA** :
- [ ] Clé OpenAI JAMAIS côté client
- [ ] Rate limiting implémenté
- [ ] Validation input utilisateur avant envoi IA

---

### 📝 EXPOSÉ CHECKPOINT 9.C — Mise à jour BlaizBot-projet

> 📚 **OBLIGATOIRE** : Documenter l'avancement après chaque phase

| Tâche | Action | Fichier cible |
|:------|:-------|:--------------|
| 9.C.1 | Incrémenter `developmentHours` (+9h) | `progress.json` |
| 9.C.2 | Ajouter résumé Phase 9 | `content/08-developpement.md` |
| 9.C.3 | Documenter architecture IA | `content/annexes/B-code-samples.md` |
| 9.C.4 | Capturer chat IA | `assets/screenshots/phase-09-ai-chat.png` |
| 9.C.5 | Commit BlaizBot-projet | `git commit -m "docs: phase 9 IA intégration"` |

**Template à ajouter dans 08-developpement.md** :
```markdown
### Phase 9 — Intégration IA (DATE)

**Durée** : 9h  
**Tâches** : X/X complétées

**Résumé** :
- OpenAI GPT-4 configuré avec streaming
- Chat IA contextuel (RAG sur cours)
- Génération de quiz interactifs
- Fiches de révision automatiques
- Modes : hint, explication, génération

**Architecture IA** :
- lib/ai/ : chat.ts, quiz.ts, revision.ts, rag.ts
- Vector store pour embeddings cours

**Captures** : `phase-09-ai-chat.png`
```

---

## 📸 Capture requise

- [ ] Vidéo chat IA avec streaming visible
- [ ] Screenshot quiz généré
- [ ] Screenshot fiche de révision

---

## ✅ Checklist fin de phase

- [ ] OpenAI configuré et testé
- [ ] Chat IA basique avec streaming
- [ ] Mode hint / explication fonctionnel
- [ ] RAG : embeddings + recherche vectorielle
- [ ] Chat contextuel (cite les cours)
- [ ] Génération de quiz interactif
- [ ] Génération de fiches de révision
- [ ] Fiches sauvegardées et visibles
- [ ] Aucun fichier > 350 lignes

---

## 🔄 Navigation

← [phase-09-ai.md](phase-09-ai.md) | [phase-10-demo.md](phase-10-demo.md) →

---

*Lignes : ~280 | Dernière MAJ : 2025-12-22*
