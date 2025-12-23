# 🤖 Phase 9 — Intégration IA

> **Objectif** : IA utile, contrôlée, stable en démo  
> **Statut** : 🔴 À FAIRE  
> **Durée estimée** : 8-10h  
> **Prérequis** : Phase 8 terminée (Interface élève complète)

---

## ⚠️ Instructions IA

```
RÈGLE 350 LIGNES (rappel) :
- Lib IA dans src/lib/ai/ — chaque fonction isolée
- API routes IA dans src/app/api/ai/ — une route par feature
- Composants chat dans src/components/features/ai/

RÈGLES PÉDAGOGIQUES :
- Mode "hint" = ne pas donner la réponse directe
- Mode "explication" = réponse complète
- JAMAIS de contenu inapproprié (filtrage)

IMPORTANT :
- OpenAI peut être lent ou down → prévoir timeout + message user
- Le streaming améliore l'UX (réponse progressive)
- Utiliser Vercel AI SDK pour simplifier le streaming
```

---

## 📚 Sources de vérité

| Source | Usage |
|--------|-------|
| `docs/07-FONCTIONNALITES_IA.md` | Specs complètes IA |
| `blaizbot-wireframe/js/modules/ai-assistant.js` | Comportement attendu |
| `docs/05-API_ENDPOINTS.md` | Routes `/api/ai/*` |

---

## 📋 Étape 9.1 — Config API OpenAI

### 🎯 Objectif
Configurer le client OpenAI et vérifier la connexion.

### 📝 Comment
Créer le client avec gestion des erreurs et variable d'environnement.

### 🔧 Par quel moyen
- Package `openai` officiel
- Variable `.env` pour la clé
- Route de test pour vérifier

| # | Tâche | Fichier | Validation |
|:--|:------|:--------|:-----------|
| 9.1.1 | Env | Ajouter `OPENAI_API_KEY` dans `.env` | Variable présente |
| 9.1.2 | Client | Créer `src/lib/ai/openai.ts` | < 30 lignes |
| 9.1.3 | Test API | `GET /api/ai/test` | Retourne 200 |

### 💡 INSTRUCTION 9.1 (Config OpenAI)

```markdown
## Contexte
Tu configures l'intégration OpenAI pour BlaizBot.

## Ta mission
1. Ajouter dans `.env` :
   ```
   OPENAI_API_KEY=sk-xxx
   ```

2. Ajouter dans `.env.example` :
   ```
   OPENAI_API_KEY=your-openai-api-key
   ```

3. Créer `src/lib/ai/openai.ts` :
   - Vérifier que OPENAI_API_KEY existe
   - Exporter le client initialisé
   - Throw une erreur claire si clé manquante

4. Créer `src/app/api/ai/test/route.ts` :
   - GET simple qui fait un appel à OpenAI (list models)
   - Retourne { success: true } ou { error }

## Packages à installer
npm install openai ai

## Code de référence
Voir [phase-09-code.md](phase-09-code.md) section 1
```

---

## 📋 Étape 9.2 — Chat IA Basique

### 🎯 Objectif
Premier chat fonctionnel avec streaming temps réel.

### 📝 Comment
Utiliser Vercel AI SDK (`ai` package) pour le streaming simplifié.

### 🔧 Par quel moyen
- `useChat` hook côté client
- `streamText` côté API
- Composants React pour l'affichage

| # | Tâche | Fichier | Validation |
|:--|:------|:--------|:-----------|
| 9.2.1 | API | `POST /api/ai/chat` | Route streaming |
| 9.2.2 | Container | `ChatContainer.tsx` | < 150 lignes |
| 9.2.3 | Messages | `ChatMessageList.tsx` | < 100 lignes |
| 9.2.4 | Input | `ChatInput.tsx` | < 80 lignes |
| 9.2.5 | Page | `student/ai/page.tsx` | Page accessible |
| 9.2.6 | Test | Envoyer message → réponse streaming | Texte progressif |

### 💡 INSTRUCTION 9.2 (Chat Basique)

```markdown
## Contexte
Tu crées le premier chat IA fonctionnel avec streaming.

## Ta mission
1. API `POST /api/ai/chat` :
   - Utiliser `streamText` de Vercel AI SDK
   - System prompt : "Tu es Blaiz'bot, assistant pédagogique"
   - Retourner un stream de texte

2. `ChatContainer.tsx` :
   - Utiliser le hook `useChat` de 'ai/react'
   - Gérer messages, input, loading
   - Afficher erreurs si timeout/échec

3. `ChatMessageList.tsx` :
   - Map sur les messages
   - Distinguer user (droite) / assistant (gauche)
   - Auto-scroll vers le bas

4. `ChatInput.tsx` :
   - Textarea avec Enter pour envoyer
   - Shift+Enter pour nouvelle ligne
   - Bouton envoyer (disabled si vide ou loading)

## Hook useChat
import { useChat } from 'ai/react';

const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
  api: '/api/ai/chat',
});

## Code de référence
Voir [phase-09-code.md](phase-09-code.md) section 2
```

**Layout Chat** :
```
┌─────────────────────────────────────────┐
│ 🤖 Assistant BlaizBot                   │
├─────────────────────────────────────────┤
│ 👤 Comment résoudre x² - 5x + 6 = 0 ?   │
│                                         │
│ 🤖 Je vais t'aider à comprendre...      │
│    D'abord, identifions les            │
│    coefficients : a=1, b=-5, c=6 █      │
├─────────────────────────────────────────┤
│ 💬 Pose ta question...            [→]   │
└─────────────────────────────────────────┘
```

---

## 📋 Étape 9.3 — Règles Pédagogiques

### 🎯 Objectif
L'IA aide à comprendre sans donner directement les réponses.

### 📝 Comment
Deux modes : "hint" (indices) et "explication" (réponse complète).

### 🔧 Par quel moyen
- System prompts différents selon le mode
- Toggle UI pour changer de mode
- Stockage du mode en state

| # | Tâche | Fichier | Validation |
|:--|:------|:--------|:-----------|
| 9.3.1 | Prompts | `src/lib/ai/prompts.ts` | < 100 lignes |
| 9.3.2 | Hint | System prompt mode hint | Ne donne pas la réponse |
| 9.3.3 | Full | System prompt mode explication | Réponse complète |
| 9.3.4 | Toggle | Composant `ModeToggle.tsx` | < 50 lignes |
| 9.3.5 | API | Modifier `/api/ai/chat` pour accepter `mode` | Param ajouté |
| 9.3.6 | Test | Tester les deux modes | Comportements différents |

### 💡 INSTRUCTION 9.3 (Règles Pédagogiques)

```markdown
## Contexte
L'IA doit s'adapter au besoin de l'élève : aider ou expliquer.

## Ta mission
1. Créer `src/lib/ai/prompts.ts` :
   - Export `SYSTEM_PROMPT_HINT` : tuteur qui guide sans donner la réponse
   - Export `SYSTEM_PROMPT_EXPLAIN` : tuteur qui explique tout
   - Fonction `getSystemPrompt(mode)` qui retourne le bon prompt

2. Mode "hint" (par défaut) :
   - "Je vais t'aider à trouver toi-même"
   - Pose des questions guidantes
   - Donne des indices progressifs
   - Ne donne JAMAIS la réponse finale

3. Mode "explication" :
   - Explique complètement
   - Montre la démarche pas à pas
   - Donne la réponse avec explications

4. `ModeToggle.tsx` :
   - Switch entre "Aide-moi à comprendre" et "Explique-moi"
   - Icônes : 💡 (hint) et 📖 (explain)

## Code de référence
Voir [phase-09-code.md](phase-09-code.md) section 3
```

---

## 🔄 Navigation

← [phase-08-student.md](phase-08-student.md) | [phase-09-ai-suite.md](phase-09-ai-suite.md) →

---

*Lignes : ~230 | Suite dans phase-09-ai-suite.md*
