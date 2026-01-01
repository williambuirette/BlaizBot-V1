# 📊 Phase 7-sexies — Centre de Pilotage Pédagogique

> **Objectif** : Transformer le dashboard professeur en centre de pilotage avec KPIs dynamiques basés sur les données existantes de l'application.

---

## 🎯 Vision

Un tableau de bord **multidimensionnel** où le professeur peut :
1. Filtrer par classe, matière, cours, chapitre, période
2. Voir les KPIs recalculés dynamiquement selon les filtres
3. Identifier les contenus à améliorer (cours mal compris)
4. Repérer les élèves en difficulté ou en progression
5. Recevoir des recommandations IA contextualisées

---

## 📊 Données Disponibles (Prisma)

| Modèle | Champs utiles | Usage KPI |
| :--- | :--- | :--- |
| `StudentScore` | `quizAvg`, `exerciseAvg`, `aiComprehension`, `continuousScore`, `finalScore` | Moyennes par cours |
| `AIActivityScore` | `comprehensionScore`, `accuracyScore`, `autonomyScore`, `finalScore` | Analyse IA |
| `StudentProgress` | `status`, `score`, `timeSpent`, `completedAt` | Progression/Engagement |
| `Progression` | `percentage`, `lastActivity` | Avancement cours |
| `Grade` | `score`, `maxScore`, `aiComment` | Notes exercices |
| `Course` → `Chapter` → `Section` | Hiérarchie contenu | Granularité filtres |
| `Class` | Regroupement élèves | Filtre principal |

---

## 🔧 Étapes d'Implémentation

### Étape 7S.1 — Types & Utilitaires

| Tâche | Fichier | Validation |
| :--- | :--- | :--- |
| 7S.1.1 | `src/types/dashboard-filters.ts` | Types filtres + KPIs |
| 7S.1.2 | `src/lib/utils/kpi-calculations.ts` | Fonctions calcul KPIs |

---

### Étape 7S.2 — API Dashboard Agrégations

| Tâche | Fichier | Validation |
| :--- | :--- | :--- |
| 7S.2.1 | `GET /api/teacher/dashboard/kpis` | Route KPIs avec filtres query |
| 7S.2.2 | `GET /api/teacher/dashboard/courses-performance` | Top/Flop cours |
| 7S.2.3 | `GET /api/teacher/dashboard/students-alerts` | Élèves à surveiller |

---

### Étape 7S.3 — Composants UI Filtres

| Tâche | Fichier | Validation |
| :--- | :--- | :--- |
| 7S.3.1 | `DashboardFilterBar.tsx` | Barre filtres combinables |
| 7S.3.2 | Hook `useDashboardFilters.ts` | État + sync URL |

---

### Étape 7S.4 — Composants UI KPIs

| Tâche | Fichier | Validation |
| :--- | :--- | :--- |
| 7S.4.1 | `KPICard.tsx` | Carte KPI avec trend |
| 7S.4.2 | `KPIGrid.tsx` | Grille 4 KPIs principaux |
| 7S.4.3 | `CoursesPerformancePanel.tsx` | Top/Flop cours |
| 7S.4.4 | `StudentsAlertsPanel.tsx` | Élèves à surveiller |

---

### Étape 7S.5 — Assemblage Dashboard

| Tâche | Fichier | Validation |
| :--- | :--- | :--- |
| 7S.5.1 | Refactorer `teacher/page.tsx` | Intégrer Centre Pilotage |
| 7S.5.2 | Client Component wrapper | Gestion filtres côté client |

---

### Étape 7S.6 — Recommandations IA (Bonus)

| Tâche | Fichier | Validation |
| :--- | :--- | :--- |
| 7S.6.1 | `POST /api/teacher/dashboard/ai-insights` | Analyse Gemini contextuelle |
| 7S.6.2 | `AIInsightsCard.tsx` | Affichage recommandations |

---

## 📐 Spécifications Détaillées

### Filtres Disponibles

```typescript
interface DashboardFilters {
  // Filtres principaux
  classId: string | null;        // Une classe ou toutes
  subjectId: string | null;      // Une matière ou toutes
  courseId: string | null;       // Un cours ou tous
  chapterId: string | null;      // Un chapitre ou tous
  
  // Filtres secondaires
  period: 'week' | 'month' | 'trimester' | 'year' | 'all';
  alertLevel: 'all' | 'critical' | 'warning' | 'good';
  
  // Recherche
  studentSearch: string;
}
```

### KPIs Calculés

| KPI | Formule | Source |
| :--- | :--- | :--- |
| **Moyenne Générale** | `AVG(StudentScore.continuousScore)` | StudentScore |
| **Taux de Réussite** | `COUNT(score >= 50%) / COUNT(*)` | StudentScore |
| **Progression Moyenne** | `AVG(Progression.percentage)` | Progression |
| **Engagement** | `COUNT(lastActivity < 7j) / COUNT(*)` | Progression |
| **Score IA Moyen** | `AVG(AIActivityScore.finalScore)` | AIActivityScore |
| **Alertes Actives** | `COUNT(score < 40%)` | StudentScore |

### Règles de Filtrage

1. **Toujours filtrer par teacherId** (session.user.id)
2. **Cascade** : Classe → Matière → Cours → Chapitre
3. **Période** : Basée sur `updatedAt` ou `createdAt`
4. **Recalcul automatique** à chaque changement de filtre

---

## 🎨 Layout UI

```
┌─────────────────────────────────────────────────────────────┐
│  CENTRE DE PILOTAGE PÉDAGOGIQUE                             │
├─────────────────────────────────────────────────────────────┤
│ Filtres: [Classe▼] [Matière▼] [Cours▼] [Période▼] [Reset]  │
├─────────────────────────────────────────────────────────────┤
│ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐    │
│ │ Moyenne   │ │ Réussite  │ │ Progress. │ │ Alertes   │    │
│ │   72%     │ │   68%     │ │   45%     │ │    4      │    │
│ │  ↑ +5%    │ │  → stable │ │  ↓ -3%    │ │  🔴 crit. │    │
│ └───────────┘ └───────────┘ └───────────┘ └───────────┘    │
├─────────────────────────────────────────────────────────────┤
│ ┌────────────────────────┬────────────────────────┐        │
│ │  📈 PERFORMANCE COURS  │  👥 ÉLÈVES À SURVEILLER │        │
│ ├────────────────────────┼────────────────────────┤        │
│ │ ✅ Chap 1: 94%         │ 🔴 Alice M. - 42%      │        │
│ │ ✅ Chap 2: 88%         │ 🟠 Thomas D. - 58%     │        │
│ │ ⚠️ Chap 5: 52%         │ 🟢 Emma L. - 92%       │        │
│ │ ⚠️ Chap 6: 61%         │                        │        │
│ └────────────────────────┴────────────────────────┘        │
├─────────────────────────────────────────────────────────────┤
│ 🤖 RECOMMANDATIONS IA                                       │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ 65% de la 6A échoue sur les fractions.                  ││
│ │ → Action : Créer un exercice de remédiation sur le PGCD ││
│ └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Checklist Fin de Phase

- [ ] Types `DashboardFilters` et `DashboardKPIs` créés
- [ ] API `/api/teacher/dashboard/kpis` fonctionnelle
- [ ] API `/api/teacher/dashboard/courses-performance` fonctionnelle
- [ ] API `/api/teacher/dashboard/students-alerts` fonctionnelle
- [ ] Composant `DashboardFilterBar` avec sélecteurs
- [ ] Composant `KPIGrid` avec 4 cartes dynamiques
- [ ] Composant `CoursesPerformancePanel` avec top/flop
- [ ] Composant `StudentsAlertsPanel` avec liste triée
- [ ] Dashboard assemblé avec recalcul au changement de filtre
- [ ] (Bonus) Insights IA Gemini contextuels
- [ ] Aucun fichier > 350 lignes
- [ ] `npm run lint` OK
- [ ] `npm run build` OK

---

## 📸 Captures Requises

- [ ] Screenshot Centre de Pilotage complet
- [ ] Screenshot avec filtres actifs (1 classe sélectionnée)
- [ ] Screenshot panel "Cours à améliorer"

