# API d'Évaluation IA

## Endpoint

```
POST /api/ai/evaluate
```

## Description

Évalue automatiquement une session chat IA selon 3 critères :
- **Compréhension** (40%) : L'élève comprend-il les concepts ?
- **Précision** (40%) : Ses réponses sont-elles exactes ?
- **Autonomie** (20%) : A-t-il besoin d'aide ?

## Authentification

Requiert une session utilisateur valide (cookie de session).

## Request Body

```json
{
  "aiChatId": "clxyz123...",
  "activityType": "QUIZ",
  "courseId": "course123",
  "activityId": "quiz456"
}
```

### Paramètres

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `aiChatId` | string | ✅ | ID de la session AIChat |
| `activityType` | enum | ✅ | `QUIZ`, `EXERCISE`, ou `REVISION` |
| `courseId` | string | ✅ | ID du cours associé |
| `activityId` | string | ❌ | ID du quiz/exercice (optionnel) |

## Response

### Succès (200)

```json
{
  "success": true,
  "data": {
    "score": 85,
    "comprehension": 82,
    "accuracy": 90,
    "autonomy": 83,
    "strengths": [
      "Maîtrise des fractions",
      "Raisonnement logique"
    ],
    "weaknesses": [
      "Confusion exposants négatifs"
    ],
    "recommendation": "Revoir les exposants avec exercices supplémentaires"
  }
}
```

### Erreurs

| Code | Message | Description |
|------|---------|-------------|
| 400 | Missing required fields | Paramètres manquants |
| 401 | Unauthorized | Session invalide |
| 403 | Forbidden | Chat appartient à un autre user |
| 404 | Chat session not found | AIChat inexistant |
| 409 | Session already evaluated | Déjà évalué (pas de double) |
| 500 | Internal server error | Erreur serveur/IA |

## Exemple d'utilisation

```typescript
// Dans le composant étudiant après avoir terminé un quiz
const handleFinishQuiz = async () => {
  try {
    const response = await fetch('/api/ai/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        aiChatId: currentChatId,
        activityType: 'QUIZ',
        courseId: currentCourseId,
        activityId: quizId
      })
    });
    
    if (!response.ok) {
      throw new Error('Evaluation failed');
    }
    
    const result = await response.json();
    
    // Afficher modal avec résultats
    showResultsModal(result.data);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## Workflow automatique (AI3.2)

Une fois AI3.2 implémenté, l'évaluation sera déclenchée automatiquement :

```
Élève termine quiz/exo
       ↓
PATCH /api/chat/sessions/:id { status: 'completed' }
       ↓
Webhook interne → POST /api/ai/evaluate
       ↓
Enregistrement AIActivityScore
       ↓
Mise à jour StudentScore.aiComprehension
```

## Données enregistrées

Chaque évaluation crée un `AIActivityScore` :

```typescript
{
  id: string;
  studentId: string;
  courseId: string;
  aiChatId: string;
  activityType: 'QUIZ' | 'EXERCISE' | 'REVISION';
  comprehensionScore: number; // 0-100
  accuracyScore: number;      // 0-100
  autonomyScore: number;      // 0-100
  finalScore: number;         // Moyenne pondérée
  duration: number;           // minutes
  messageCount: number;
  strengths: string[];        // JSON
  weaknesses: string[];       // JSON
  recommendation: string;
  createdAt: Date;
}
```

## Agrégation scores

La moyenne des scores IA est automatiquement mise à jour dans `StudentScore` :

```sql
SELECT 
  AVG(comprehensionScore) as aiComprehension,
  COUNT(*) as aiSessionCount
FROM AIActivityScore
WHERE studentId = ? AND courseId = ?
```

## Limites & Améliorations futures

- [ ] Tracker tokens réels (actuellement 0)
- [ ] Support thèmes/chapitres spécifiques
- [ ] Cache des évaluations (éviter re-évaluation)
- [ ] Webhook retry en cas d'échec
- [ ] Rate limiting (max X évaluations/heure)
