# 🤖 Phase 7ter — Évaluation Automatique IA

> **Objectif** : Intégrer un système d'auto-évaluation par l'IA pour chaque interaction élève  
> **Statut** : ⏳ EN COURS  
> **Durée estimée** : 7h30  
> **Prérequis** : Phase 7bis terminée (Système de scoring)
> **Prompts** : [prompts/phase-07ter-ai-evaluation.md](../prompts/phase-07ter-ai-evaluation.md)

---

## 🎯 Objectifs de cette Phase

1. **Évaluer automatiquement** : L'IA note chaque quiz/exercice/révision (0-100%)
2. **Critères multiples** : Compréhension, Précision, Autonomie
3. **Intégrer partout** : Scores IA visibles sur toutes les pages (Élèves, Classes, Cours)
4. **Feedback élève** : Modal avec détails après chaque activité
5. **Analytics prof** : Dashboard activités IA par élève/classe/thème

---

## 📐 Architecture

### Flux d'Évaluation

```
Élève termine Quiz/Exo/Révision via Chat IA
              ↓
    Fin de session détectée
              ↓
    API /api/ai/evaluate (POST)
              ↓
    IA évalue selon 3 critères
    - Compréhension (0-100)
    - Précision (0-100)
    - Autonomie (0-100)
              ↓
    Enregistrement AIActivityScore
              ↓
    Agrégation → StudentScore.aiComprehension
              ↓
    Affichage partout (cartes, tableaux, graphiques)
```

---

## 📋 Tâches

### Phase AI1 : Migration BDD (20min)

| # | Tâche | Description | Effort | Statut |
|:--|:------|:------------|:-------|:-------|
| **AI1.1** | Modèle AIActivityScore | Créer modèle Prisma avec scores IA | 10min | ✅ |
| **AI1.2** | Relations BDD | Ajouter relations User/Course/AIChat | 10min | ✅ |

#### Fichiers à créer/modifier
- `prisma/schema.prisma` : Nouveau modèle + relations

#### Critères de validation
- [ ] Modèle AIActivityScore avec tous les champs
- [ ] Relations vers User, Course, ChatSession
- [ ] Enum ActivityType (QUIZ, EXERCISE, REVISION)
- [ ] `npx prisma db push` réussit

---

### Phase AI2 : Service d'Évaluation (45min)

| # | Tâche | Description | Effort | Statut |
|:--|:------|:------------|:-------|:-------|
| **AI2.1** | Service évaluation | Fonctions evaluateQuizSession, evaluateExerciseSession, evaluateRevisionSession | 20min | ✅ |
| **AI2.2** | Prompts templates | Prompts spécialisés par type d'activité | 15min | ✅ |
| **AI2.3** | Agrégation scores | Fonction updateStudentScoreFromAI() | 10min | ✅ |

#### Fichiers à créer
- `src/lib/ai-evaluation-service.ts` (~200 lignes)

#### Interfaces clés
```typescript
interface EvaluationResult {
  comprehension: number;    // 0-100
  accuracy: number;         // 0-100
  autonomy: number;         // 0-100
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
}
```

#### Critères de validation
- [ ] evaluateQuizSession() retourne EvaluationResult
- [ ] evaluateExerciseSession() retourne EvaluationResult
- [ ] evaluateRevisionSession() retourne EvaluationResult
- [ ] saveActivityScore() enregistre en BDD
- [ ] updateStudentScoreFromAI() met à jour StudentScore
- [ ] Tous les prompts IA sont testés
- [ ] < 250 lignes

---

### Phase AI3 : API Routes (30min)

| # | Tâche | Description | Effort | Statut |
|:--|:------|:------------|:-------|:-------|
| **AI3.1** | API trigger évaluation | POST /api/ai/evaluate | 15min | ✅ |
| **AI3.2** | Webhook fin session | Modifier PATCH /api/chat/sessions/[id] | 15min | ✅ |

#### Fichiers à créer/modifier
- Nouveau : `src/app/api/ai/evaluate/route.ts`
- Modifier : `src/app/api/chat/sessions/[id]/route.ts`

#### Route POST /api/ai/evaluate
```typescript
// Body
{
  sessionId: string;
  activityType: 'QUIZ' | 'EXERCISE' | 'REVISION';
  activityId?: string;
  themeId?: string;
}

// Réponse
{
  success: true,
  data: {
    score: 85,
    comprehension: 82,
    accuracy: 90,
    autonomy: 83,
    strengths: [...],
    weaknesses: [...],
    recommendation: "..."
  }
}
```

#### Critères de validation
- [ ] POST /api/ai/evaluate fonctionne
- [ ] Vérification session appartient à l'élève
- [ ] Fin de session déclenche évaluation auto
- [ ] Erreurs gérées (403, 404, 500)
- [ ] Logs détaillés
- [ ] < 100 lignes par route

---

### Phase AI4 : Modifications Pages Élèves (3h10)

| # | Tâche | Description | Effort | Statut |
|:--|:------|:------------|:-------|:-------|
| **AI4.1** | Page Liste Élèves | Ajouter badge "Score IA" sur StudentCard + compteur Moy IA | 30min | ✅ |
| **AI4.2** | Page Fiche Élève | Onglet "Activités IA" + colonne IA dans CourseScoreRow | 1h | ✅ |
| **AI4.3** | Composant AIActivitiesTab | Tableau historique + graphique progression | 40min | ✅ |
| **AI4.4** | Page Détail Cours Élève | `/teacher/students/[id]/courses/[courseId]` | 1h | ✅ |

#### Fichiers à modifier (AI4.1)
- `src/components/features/teacher/StudentCard.tsx` : Ajouter 4ème badge
- `src/components/features/teacher/StatsCounters.tsx` : Ajouter 5ème carte
- `src/app/(dashboard)/teacher/students/page.tsx` : Enrichir query

**StudentCard AVANT** :
```
┌──────┬──────┬──────┐
│ 68%  │ 4.2  │ 4.4  │
│Cont. │ Exam │Final │
└──────┴──────┴──────┘
```

**StudentCard APRÈS** :
```
┌──────┬──────┬──────┬──────┐
│ 68%  │ 72%  │ 4.2  │ 4.4  │
│Cont. │  IA  │ Exam │Final │
└──────┴──────┴──────┴──────┘
```

#### Fichiers à modifier (AI4.2)
- `src/components/features/teacher/StudentScorePage.tsx` : Ajouter Tabs
- `src/components/features/teacher/CourseScoreRow.tsx` : Ajouter colonne IA

#### Fichiers à créer (AI4.3)
- `src/components/features/teacher/AIActivitiesTab.tsx` (~150 lignes)

**AIActivitiesTab UI** :
```
┌─────────────────────────────────────────────────────────────┐
│ 🤖 Activités IA de Lucas MARTIN                             │
├─────────────────────────────────────────────────────────────┤
│ Période : [Dernière semaine ▼]                              │
│ ┌────────────┬──────┬──────┬──────┬──────┬──────────────┐  │
│ │ Date       │ Type │ Thème│ Score│ Durée│ Recommandation│  │
│ ├────────────┼──────┼──────┼──────┼──────┼──────────────┤  │
│ │ 28/12 14h  │ Quiz │Fract.│ 85%  │ 12min│ Revoir expo  │  │
│ │ 27/12 16h  │ Exo  │Équat.│ 72%  │ 25min│ OK           │  │
│ │ 26/12 10h  │Révis.│Géom. │ 68%  │ 18min│ Approfondir  │  │
│ └────────────┴──────┴──────┴──────┴──────┴──────────────┘  │
│                                                             │
│ 📈 Progression Compréhension                                │
│ [Chart.js ligne : 60% → 68% → 72% → 85%]                   │
└─────────────────────────────────────────────────────────────┘
```

#### Critères de validation AI4
- [ ] StudentCard affiche badge IA (72%)
- [ ] StatsCounters affiche "Moy IA"
- [ ] Query enrichie avec aiComprehension
- [ ] Onglet "Activités IA" visible
- [ ] Tableau historique fonctionnel
- [ ] Graphique progression (Chart.js)
- [ ] Colonne IA dans CourseScoreRow
- [ ] **Page détail cours élève accessible (click sur CourseScoreRow)**
- [ ] < 200 lignes par composant
- [ ] npm run build OK

---

#### AI4.4 — Page Détail Cours Élève (`/teacher/students/[id]/courses/[courseId]`) — 1h

**Fichiers à créer** :
- `src/app/(dashboard)/teacher/students/[id]/courses/[courseId]/page.tsx` (Server Component)
- `src/components/features/teacher/StudentCourseDetailPage.tsx` (Client Component)
- `src/components/features/teacher/CourseActivityTimeline.tsx` (~120 lignes)

**Page UI** :
```
┌─────────────────────────────────────────────────────────────┐
│ ← Retour   Emma DURAND — Les Fractions                      │
│ 3ème A (6ème) • emma.durand@blaizbot.edu                    │
├─────────────────────────────────────────────────────────────┤
│ 📊 KPIs COURS                                               │
│ ┌──────────┬──────────┬──────────┬──────────┬──────────┐   │
│ │ 88%      │ 85%      │ 5.5      │ 5.4      │ 🟢       │   │
│ │ Continu  │ Moy IA   │ Examen   │ Final    │ Statut   │   │
│ └──────────┴──────────┴──────────┴──────────┴──────────┘   │
├─────────────────────────────────────────────────────────────┤
│ 🤖 ACTIVITÉS IA (Chronologique)                             │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ 28/12 14h30 • Quiz - Simplifier fractions             │   │
│ │ Score: 90% (🧠 88% • ✅ 92% • 🚀 90%)                 │   │
│ │ 💪 Excellente maîtrise PGCD                           │   │
│ │ 📝 Revoir les fractions négatives                     │   │
│ └───────────────────────────────────────────────────────┘   │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ 27/12 16h15 • Exercice - Comparaison fractions        │   │
│ │ Score: 75% (🧠 72% • ✅ 80% • 🚀 73%)                 │   │
│ │ 💪 Bonne démarche logique                             │   │
│ │ 📝 Hésitations sur dénominateurs communs              │   │
│ └───────────────────────────────────────────────────────┘   │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ 26/12 10h00 • Révision - Bases fractions              │   │
│ │ Score: 68% (🧠 65% • ✅ 70% • 🚀 70%)                 │   │
│ │ 💪 Questions pertinentes                              │   │
│ │ 📝 Confusion numérateur/dénominateur                  │   │
│ └───────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│ 📝 QUIZ (5)                                                 │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ Quiz 1: Reconnaître fractions • Score: 90%           │   │
│ │ Quiz 2: Simplifier fractions • Score: 85%            │   │
│ │ Quiz 3: Addition fractions • Score: 80%              │   │
│ └───────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│ 💻 EXERCICES (3)                                            │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ Exo 1: Comparaison • Score: 75% • Temps: 18min       │   │
│ │ Exo 2: Opérations mixtes • Score: 82% • Temps: 25min │   │
│ └───────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│ 📈 PROGRESSION                                              │
│ [Chart.js ligne : Evolution des scores IA dans le temps]   │
└─────────────────────────────────────────────────────────────┘
```

**Logique** :
1. Server component vérifie accès (prof possède la classe de l'élève)
2. Query enrichie :
   - StudentScore pour ce cours
   - AIActivityScore filtrés par courseId
   - StudentProgress (quiz/exercices)
3. Client component affiche timeline chronologique + graphique

**Critères de validation AI4.4** :
- [ ] Page accessible via click sur CourseScoreRow
- [ ] 4 KPIs en header
- [ ] Timeline activités IA chronologique
- [ ] Sections Quiz et Exercices
- [ ] Graphique progression
- [ ] Retour vers fiche élève
- [ ] < 200 lignes par composant
- [ ] npm run build OK

---

### Phase AI5 : Modifications Pages Classes (1h15)

| # | Tâche | Description | Effort | Statut |
|:--|:------|:------------|:-------|:-------|
| **AI5.1** | Page Liste Classes | Ajouter badge "Score IA moyen" sur TeacherClassCard | 15min | ✅ |
| **AI5.2** | Page Détail Classe | Section "Top élèves actifs IA" + colonne IA | 30min | ✅ |
| **AI5.3** | Composant ClassAIStats | KPIs IA pour la classe | 30min | ✅ |

#### Fichiers à modifier (AI5.1)
- `src/components/features/teacher/TeacherClassCard.tsx`
- `src/lib/class-filters.ts` : calculateClassGroupStats()

**TeacherClassCard AVANT** :
```
│ 9ème A        │
│ 24 élèves     │
│ Moy: 4.5/6 🟢 │
```

**TeacherClassCard APRÈS** :
```
│ 9ème A           │
│ 24 élèves        │
│ Moy: 4.5/6 🟢    │
│ IA: 72% 🟢       │
```

#### Fichiers à modifier (AI5.2)
- `src/app/(dashboard)/teacher/classes/[id]/page.tsx`

#### Fichiers à créer (AI5.3)
- `src/components/features/teacher/ClassAIStats.tsx` (~80 lignes)

**ClassAIStats UI** :
```
┌─────────────────────────────────────────────────────────────┐
│ 🤖 ACTIVITÉS IA (Top 3 élèves actifs)                       │
│ 1. Lucas MARTIN : 12 sessions, score moyen 85%             │
│ 2. Emma DURAND : 8 sessions, score moyen 78%               │
│ 3. Noah PETIT : 6 sessions, score moyen 65%                │
└─────────────────────────────────────────────────────────────┘
```

#### Critères de validation AI5
- [ ] Badge "IA: XX%" sur carte classe
- [ ] calculateClassGroupStats() inclut avgAiScore
- [ ] Section "Top élèves actifs IA"
- [ ] Colonne IA dans tableau élèves
- [ ] < 150 lignes par composant
- [ ] npm run build OK

---

### Phase AI6 : Modifications Pages Cours (1h30)

| # | Tâche | Description | Effort | Statut |
|:--|:------|:------------|:-------|:-------|
| **AI6.1** | Page Liste Cours | Badge "Moy IA" sur TeacherCourseCard | 20min | ✅ |
| **AI6.2** | Page Détail Thème | Métriques IA complètes + analyse | 1h10 | ✅ |

#### Fichiers à modifier (AI6.1)
- `src/components/features/teacher/TeacherCourseCard.tsx`

**TeacherCourseCard APRÈS** :
```
┌─────────────────────────────────────────────────────────┐
│ 📘 Mathématiques 9ème                                   │
│ 3 thèmes • 12 quiz • 8 exercices                        │
│ ┌──────────┬──────────┬──────────┬──────────┬─────────┐│
│ │ 🎯 68%   │ 👥 24    │ 📊 4.2/6 │ 🤖 72%   │🔍🟢 75% ││
│ │ Réussite │ Élèves   │ Moy exam │ Moy IA   │Pertinence│
│ └──────────┴──────────┴──────────┴──────────┴─────────┘│
└─────────────────────────────────────────────────────────┘
```

#### Fichiers à modifier (AI6.2)
- `src/app/(dashboard)/teacher/courses/[id]/themes/[themeId]/page.tsx`

#### Fichiers à créer (AI6.2)
- `src/components/features/teacher/ThemeAIMetrics.tsx` (~100 lignes)
- `src/components/features/teacher/AIAnalysisPanel.tsx` (~150 lignes)

**ThemeAIMetrics UI** :
```
┌──────────┬──────────┬──────────┬──────────┬──────────┐
│ 55%      │ 32%      │ 18 q/élv │ 15min    │ 68%      │
│ Réussite │ Abandon  │ Questions│ Temps IA │ Score IA │
└──────────┴──────────┴──────────┴──────────┴──────────┘
```

**AIAnalysisPanel UI** :
```
┌─────────────────────────────────────────────────────────────┐
│ 🤖 ANALYSE IA                                               │
│ Questions fréquentes (top 3):                               │
│ 1. "Comment isoler x ?" (12 fois)                           │
│ 2. "Différence équation/inéquation ?" (8 fois)              │
│ 3. "Vérifier résultat ?" (6 fois)                           │
│                                                             │
│ 💡 Suggestions IA :                                         │
│ • Ajouter un quiz sur isolation de variable                │
│ • Créer exercice de distinction équation/inéquation        │
│ • Vidéo explicative sur vérification résultats             │
└─────────────────────────────────────────────────────────────┘
```

#### Critères de validation AI6
- [ ] Badge "Moy IA" sur carte cours
- [ ] 5 KPIs dans header thème (dont Score IA)
- [ ] Score IA par quiz/exercice
- [ ] Panel "Analyse IA" avec questions fréquentes
- [ ] Suggestions IA automatiques
- [ ] < 200 lignes par composant
- [ ] npm run build OK

---

### Phase AI7 : UI Feedback Élève (40min)

| # | Tâche | Description | Effort | Statut |
|:--|:------|:------------|:-------|:-------|
| **AI7.1** | Modal résultats | AIScoreModal après quiz/exo | 20min | ✅ |
| **AI7.2** | Badge score temps réel | LiveScoreBadge dans chat | 10min | ✅ |
| **AI7.3** | Intégration chat | Déclencher modal après session | 10min | ✅ |

#### Fichiers à créer
- `src/components/features/student/AIScoreModal.tsx` (~100 lignes)
- `src/components/features/student/LiveScoreBadge.tsx` (~40 lignes)

**AIScoreModal UI** :
```
┌─────────────────────────────────────────────────┐
│ 🎉 Quiz terminé !                               │
├─────────────────────────────────────────────────┤
│ 📊 Ton score : 85/100                           │
│ ┌──────────────┬──────────────┬──────────────┐ │
│ │ 🧠 82%       │ ✅ 90%       │ 🚀 83%       │ │
│ │ Compréhension│ Précision    │ Autonomie    │ │
│ └──────────────┴──────────────┴──────────────┘ │
│                                                 │
│ 💪 Points forts :                               │
│ • Maîtrise des fractions                        │
│ • Raisonnement logique                          │
│                                                 │
│ 📝 À améliorer :                                │
│ • Confusion exposants négatifs                  │
│                                                 │
│ 🎯 Recommandation :                             │
│ Revoir les exposants avec exercices             │
│ supplémentaires                                 │
│                                                 │
│ [Continuer] [Voir détails]                      │
└─────────────────────────────────────────────────┘
```

#### Critères de validation AI7
- [ ] Modal s'affiche après fin de session
- [ ] 3 badges (Compréhension, Précision, Autonomie)
- [ ] Points forts/faibles affichés
- [ ] Recommandation claire
- [ ] Boutons fonctionnels
- [ ] < 120 lignes par composant
- [ ] npm run build OK

---

## 🧪 Tests de Validation Finale

### Test Fonctionnel Élève
- [ ] Élève termine un quiz via chat IA
- [ ] Modal résultats s'affiche avec score
- [ ] Score apparaît dans StudentCard (page prof)
- [ ] Score apparaît dans fiche élève détaillée
- [ ] Historique visible dans onglet "Activités IA"

### Test Fonctionnel Prof
- [ ] Page "Mes Élèves" affiche badge IA
- [ ] Compteur "Moy IA" visible
- [ ] Onglet "Activités IA" dans fiche élève
- [ ] Graphique progression fonctionne
- [ ] Page "Mes Classes" affiche scores IA
- [ ] Page thème affiche analyse IA

### Test Sécurité
- [ ] Élève ne peut évaluer que ses propres sessions
- [ ] Prof ne voit que ses élèves/classes
- [ ] Rate limiting en place (max 10 éval/min)

### Test Performance
- [ ] Temps évaluation IA < 5s
- [ ] Pas de lag lors affichage scores
- [ ] Charts.js performant (>30fps)

### Test Build
- [ ] `npm run lint` OK
- [ ] `npm run build` OK
- [ ] Tous fichiers < 350 lignes

---

## 📊 Résumé Effort

| Phase | Tâches | Fichiers | Effort | Statut |
|:------|:-------|:---------|:-------|:-------|
| AI1 (BDD) | 2 | 1 | 20min | ✅ |
| AI2 (Service) | 3 | 1 | 45min | ✅ |
| AI3 (API) | 2 | 2 | 30min | ✅ |
| AI4 (Pages Élèves) | **4** | **9** | **3h10** | ✅ |
| AI5 (Pages Classes) | 3 | 4 | 1h15 | ✅ |
| AI5.bis (Détail Classe) | 4 | 1 | 1h | ✅ |
| AI5.ter (Messagerie) | 6 | 3 | 2h | ✅ |
| AI6 (Pages Cours) | 2 | 4 | 1h30 | ✅ |
| AI7 (UI Élève) | 3 | 2 | 40min | ✅ |
| **CP (Perf. Cours)** | **6** | **4** | **2h30** | **⬜** |
| **TOTAL** | **35** | **31** | **~13h45** | **⏳** |

---

## 🔄 Ordre d'Exécution Recommandé

```
1. AI1.1  → Modèle BDD (base)
2. AI1.2  → Relations BDD
3. AI2.1  → Service évaluation (core)
4. AI2.2  → Prompts templates
5. AI2.3  → Agrégation scores
6. AI3.1  → API /ai/evaluate
7. AI3.2  → Webhook session
8. AI7.1  → Modal élève (feedback immédiat)
9. AI4.1  → Page Liste Élèves (impact visible)
10. AI4.2 → Fiche élève détaillée
11. AI4.3 → Onglet Activités IA
12. AI4.4 → Page Détail Cours Élève (nouveau)
13. AI5.1 → Page Liste Classes
14. AI5.2 → Détail Classe
15. AI5.3 → ClassAIStats
16. AI6.1 → Page Liste Cours
17. AI6.2 → Détail Thème (analyse complète)
18. AI7.2 → LiveScoreBadge
19. AI7.3 → Intégration finale chat
```

---

## 🔄 Navigation

← [phase-07bis-scoring.md](phase-07bis-scoring.md) | [phase-08-student.md](phase-08-student.md) →

---

*Lignes : ~550 | Dernière MAJ : 2025-12-30*

---

### Phase AI5.bis : Amélioration Page Détail Classe (1h)

| # | Tâche | Description | Effort | Statut |
|:--|:------|:------------|:-------|:-------|
| **AI5.bis.1** | Transformer en tableau | Remplacer la liste d'élèves par un `Table` shadcn | 25min | ✅ |
| **AI5.bis.2** | Liens et tri | Ajouter liens vers profil élève et tri sur colonnes | 15min | ✅ |
| **AI5.bis.3** | Filtre et recherche | Ajouter un champ de recherche pour filtrer les élèves | 10min | ✅ |
| **AI5.bis.4** | Actions de groupe | Ajouter checkboxes et menu d'actions groupées | 10min | ✅ |

#### Critères de validation AI5.bis
- [x] La liste d'élèves est maintenant un tableau triable.
- [x] Le nom de l'élève est un lien cliquable.
- [x] Un champ de recherche filtre le tableau.
- [x] Des cases à cocher permettent de sélectionner des élèves.
- [x] Le build `npm run build` passe sans erreur.

---

### Phase AI5.ter : Amélioration Messagerie (45min)

| # | Tâche | Description | Effort | Statut |
|:--|:------|:------------|:-------|:-------|
| **AI5.ter.1** | Affichage bulles chat | Afficher les messages dans des bulles avec alignement | 15min | ✅ |
| **AI5.ter.2** | Bouton fichiers | Ajouter bouton Paperclip pour joindre fichiers | 15min | ✅ |
| **AI5.ter.3** | API upload fichiers | Route POST pour gérer les fichiers joints | 15min | ✅ |

#### Fichiers à modifier (AI5.ter.1)
- `src/app/(dashboard)/teacher/messages/page.tsx`

**Affichage bulles AVANT** :
```
┌─────────────────────────────────────────────┐
│ Groupe - 1 élèves                           │
│ test 2                                      │
│ Il y a moins d'une minute                   │
│                                             │
│ [Zone vide]                                 │
└─────────────────────────────────────────────┘
```

**Affichage bulles APRÈS** :
```
┌─────────────────────────────────────────────┐
│ Groupe - 1 élèves                           │
│ Léa MOREAU                                  │
├─────────────────────────────────────────────┤
│                    ┌──────────────────┐     │
│                    │ test 2           │     │
│                    │ 14:30            │     │
│                    └──────────────────┘     │
│ ┌──────────────────┐                        │
│ │ Bonjour !        │                        │
│ │ 14:35            │                        │
│ └──────────────────┘                        │
└─────────────────────────────────────────────┘
```

#### Fichiers à modifier (AI5.ter.2)
- `src/app/(dashboard)/teacher/messages/page.tsx`

**Input AVANT** :
```
┌─────────────────────────────────────────────┐
│ [Écrivez votre message...]         [Envoyer]│
└─────────────────────────────────────────────┘
```

**Input APRÈS** :
```
┌─────────────────────────────────────────────┐
│ [📎] [Écrivez votre message...]    [Envoyer]│
│ 📁 document.pdf (2.3 MB)                    │
└─────────────────────────────────────────────┘
```

#### Fichiers à créer (AI5.ter.3)
- `src/app/api/teacher/messages/[id]/route.ts` (~120 lignes)

**Route POST /api/teacher/messages/[id]** :
```typescript
// Body: FormData
{
  content: string;           // Texte du message
  conversationId: string;    // ID conversation
  attachments: File[];       // Fichiers joints
}

// Réponse
{
  success: true,
  data: {
    id: string;
    content: string;
    senderId: string;
    senderName: string;
    attachments: string[];   // URLs des fichiers
    createdAt: Date;
  }
}
```

**Formats acceptés** :
- Documents : `.pdf`, `.doc`, `.docx`
- Tableurs : `.xls`, `.xlsx`
- Présentations : `.ppt`, `.pptx`
- Images : `.jpg`, `.jpeg`, `.png`

#### Critères de validation AI5.ter
- [x] Les messages s'affichent en bulles de chat
- [x] Messages de l'envoyeur alignés à droite (bleu)
- [x] Messages des autres alignés à gauche (gris)
- [x] Bouton Paperclip visible dans l'input
- [x] Sélection multi-fichiers fonctionne
- [x] Formats de fichiers validés (PDF, docs, images)
- [x] Route POST gère FormData
- [x] Upload fichiers enregistré en BDD (champ attachments)
- [x] Le build `npm run build` passe sans erreur

#### AI5.ter.4 - Téléchargement de fichiers joints
**Objectif** : Permettre aux destinataires de télécharger les fichiers joints en cliquant sur les pièces jointes dans les bulles.

| # | Sous-tâche | Description | Effort | Statut |
|:--|:-----------|:------------|:-------|:-------|
| **AI5.ter.4.1** | Affichage pièces jointes | Badges cliquables avec icônes dans bulles | 20min | ✅ |
| **AI5.ter.4.2** | Handler téléchargement | Click → fetch API → blob download | 15min | ✅ |
| **AI5.ter.4.3** | Route API GET fichiers | Créer `/api/.../files/[messageId]/[filename]` | 20min | ✅ |
| **AI5.ter.4.4** | Stockage physique (POST) | Sauvegarder fichiers dans `/public/uploads/` | 30min | ✅ |
| **AI5.ter.4.5** | Récupération fichiers (GET) | Lire et servir fichiers avec bon Content-Type | 25min | ✅ |
| **AI5.ter.4.6** | Tests end-to-end | Upload → Affichage → Download complet | 10min | ✅ |

**Stratégie de stockage retenue** : `/public/uploads/messages/[conversationId]/[messageId]/` (Option B)
- ✅ Simple pour dev/démo
- ✅ Pas besoin de service externe
- ⚠️ Fichiers publics (pas de vérification côté serveur pour le download direct)
- 🔄 Migration future vers Vercel Blob ou S3 pour prod

**Effort total estimé** : 2h

**Statut global** : ✅ TERMINÉ - Tests manuels validés avec succès

**Résultats des tests** :
- ✅ Upload multi-fichiers fonctionnel (Excel, PDF testés)
- ✅ Stockage physique dans `/public/uploads/messages/[conversationId]/[messageId]/`
- ✅ Système de debugging avec logs détaillés  
- ✅ Téléchargement pour nouveaux fichiers opérationnel
- ✅ Gestion d'erreur 404 pour anciens fichiers (pré-implémentation)
- ✅ .gitignore mis à jour pour exclure uploads

#### Tests validés AI5.ter.4
**✅ Tests effectués avec succès** :

- [x] **Test 1 - Upload fichier unique** : ✅ VALIDÉ
  - Fichier Excel "Plan_comptable_corrige_proposition.xlsx" uploadé avec succès
  - Badge visible avec icône et nom
  - Fichier physique stocké dans `/public/uploads/messages/25240683-d449-414b-b2e7-71db2cf967f0/bf03e3a4-0950-4ef1-bcc4-1835fc71d56e/`

- [x] **Test 2 - Upload multi-fichiers** : ✅ VALIDÉ
  - Fichiers Excel et PDF uploadés séparément et stockés correctement
  - Icônes différenciées (FileSpreadsheet, FileText)
  - Messages avec badges cliquables affichés

- [x] **Test 3 - Téléchargement** : ✅ VALIDÉ POUR NOUVEAUX FICHIERS
  - Nouveaux fichiers (post-implémentation) : téléchargement fonctionnel
  - Anciens fichiers (pré-implémentation) : erreur 404 attendue
  - Système de debugging avec logs détaillés implémenté

- [ ] **Test 4 - Formats multiples** :
  - Tester PDF, Word (.docx), Excel (.xlsx), PowerPoint (.pptx), Images (.jpg, .png)
  - Tous les formats acceptés
  - Icônes correctes affichées
  - Content-Type correct au téléchargement

- [ ] **Test 5 - Noms avec caractères spéciaux** :
  - Upload fichier avec nom : `Mon Fichier (2024) - Test #1.pdf`
  - Vérifier que le fichier est sauvegardé avec nom sanitizé
  - Au téléchargement, récupérer le nom original

- [ ] **Test 6 - Sécurité** :
  - Se connecter avec un compte non-participant
  - Tenter d'accéder à l'URL du fichier directement
  - Devrait retourner erreur 404 (conversation non trouvée)

- [ ] **Test 7 - Console** :
  - Aucune erreur dans la console navigateur
  - Logs serveur montrent `✅ Fichier sauvegardé` et `📥 Téléchargement fichier`

- [ ] **Test 8 - Build** :
  - `npm run build` passe sans erreur
  - `/public/uploads/` ignoré par Git

---

### Phase CP : Compteurs Performance Cours (2h30) ✅ TERMINÉE

> **Objectif** : Ajouter des compteurs de performance globale sur la page Mes Cours  
> **Base sur** : StudentScore + AIActivityScore agreges par cours  
> **Periode** : Annee scolaire en cours  
> **Seuil minimum** : 1 eleve

| # | Tache | Description | Effort | Statut |
|:--|:------|:------------|:-------|:-------|
| **CP1** | Types et interfaces | Creer types CoursePerformance, CourseStats | 15min | ✅ |
| **CP2** | API stats cours | Enrichir /api/teacher/courses avec stats eleves | 45min | ✅ |
| **CP3** | Badge Performance | Composant avec note A+/A/B/C/D colore | 20min | ✅ |
| **CP4** | Header Stats | Vue d'ensemble (total cours, eleves, perf moyenne) | 25min | ✅ |
| **CP5** | Integration page | Modifier page courses avec nouvelles colonnes | 30min | ✅ |
| **CP6** | Tests et validation | Tests manuels + build | 15min | ✅ |

#### Fichiers créés/modifiés

| Fichier | Action |
|:--------|:-------|
| `src/types/course-stats.ts` | CRÉÉ - Types CoursePerformance, CourseWithStats, CoursesOverview |
| `src/app/api/teacher/courses/route.ts` | MODIFIÉ - GET enrichi avec stats performance |
| `src/components/features/teacher/CoursePerformanceBadge.tsx` | CRÉÉ - Badge coloré avec tooltip |
| `src/components/features/teacher/CoursesStatsHeader.tsx` | CRÉÉ - 3 cartes de stats |
| `src/components/features/teacher/CoursesTable.tsx` | MODIFIÉ - Nouvelle colonne Performance |
| `src/app/(dashboard)/teacher/courses/page.tsx` | MODIFIÉ - Intégration header stats |

#### Specifications CP

**Calcul Performance Globale** :
- studentScoreAvg = moyenne(StudentScore.totalScore) // 0-100
- aiScoreAvg = moyenne(AIActivityScore.finalScore)   // 0-100
- globalPerformance = (studentScoreAvg * 0.6) + (aiScoreAvg * 0.4)

**Grades** :
- A+ : 90-100% (vert fonce)
- A  : 80-89%  (vert)
- B  : 70-79%  (orange)
- C  : 60-69%  (rouge clair)
- D  : <60%    (rouge)

**Colonnes tableau** :
- AVANT : Matiere | Theme | Chapitres | Score IA | Actions
- APRES : Matiere | Theme | Eleves | Perf. Globale | Score IA | Actions

#### Criteres de validation CP
- [ ] Types CoursePerformance exportes et utilisables
- [ ] API retourne les stats agregees par cours
- [ ] Badge colore selon grade (A+/A/B/C/D)
- [ ] Header affiche totaux (cours, eleves, performance)
- [ ] Colonne Chapitres supprimee
- [ ] Colonne Eleves affiche X/Y
- [ ] Calcul base sur annee scolaire en cours
- [ ] Minimum 1 eleve pour afficher performance
- [ ] npm run build passe sans erreur

---

*Derniere mise a jour : 2025-12-31*
