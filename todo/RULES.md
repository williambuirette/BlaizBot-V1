# 📏 Règles Obligatoires pour l'IA

> **Ce fichier DOIT être lu avant toute génération de code.**

---

## 🔒 Règle #1 : Limite de 350 lignes

```
CHAQUE fichier généré DOIT faire < 350 lignes.
Exceptions : package-lock.json, fichiers générés, configs
```

### Structure type d'un composant (max 350 lignes)

```typescript
// === IMPORTS (10-20 lignes) ===
import ...

// === TYPES (10-30 lignes) ===
interface Props { ... }
type State = ...

// === COMPOSANT (100-200 lignes) ===
export function MyComponent({ ... }: Props) {
  // hooks
  // handlers
  // render
}

// === HELPERS (50-100 lignes) ===
function helperFunction() { ... }

// === EXPORT (1 ligne) ===
export default MyComponent;
```

### Si > 350 lignes → DÉCOUPER

| Situation | Action |
|:----------|:-------|
| Page trop longue | Extraire composants dans `/components/` |
| API route complexe | Extraire logique dans `/lib/` |
| Beaucoup de types | Créer fichier `types.ts` dédié |
| Helpers nombreux | Créer fichier `utils.ts` |

---

## 🔒 Règle #2 : Zéro Secrets en dur

```
JAMAIS de clés API, mots de passe, tokens dans le code.
TOUJOURS utiliser .env
```

### Variables requises dans `.env`

```bash
# Base de données
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Auth
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"

# IA
OPENAI_API_KEY="sk-..."
# ou ANTHROPIC_API_KEY="sk-ant-..."
# ou GOOGLE_AI_API_KEY="..."

# Vercel (auto-injecté)
# POSTGRES_PRISMA_URL, POSTGRES_URL_NON_POOLING
```

### Vérification avant commit

```bash
# Rechercher des secrets potentiels
grep -r "sk-" --include="*.ts" --include="*.tsx"
grep -r "password" --include="*.ts" --include="*.tsx"
```

---

## 🔒 Règle #3 : TypeScript Strict

```typescript
// ❌ INTERDIT
const data: any = ...
function process(input) { ... }

// ✅ OBLIGATOIRE
const data: UserData = ...
function process(input: InputType): OutputType { ... }
```

### Types à toujours définir

- Props de composants
- Retours d'API
- États (useState)
- Paramètres de fonctions

---

## 🔒 Règle #4 : Commits Atomiques

```bash
# Format: type(scope): description

feat(auth): add login form
fix(api): handle null user in session
docs(readme): update installation steps
refactor(components): extract Button component
chore(deps): update next to 15.1
```

### Types autorisés

| Type | Usage |
|:-----|:------|
| `feat` | Nouvelle fonctionnalité |
| `fix` | Correction de bug |
| `docs` | Documentation |
| `refactor` | Refactoring sans changement fonctionnel |
| `chore` | Maintenance (deps, configs) |
| `test` | Ajout/modification de tests |
| `style` | Formatage, lint |

---

## 🔒 Règle #5 : API Response Format

```typescript
// ✅ Succès
return NextResponse.json({ 
  success: true, 
  data: result 
});

// ✅ Erreur
return NextResponse.json({ 
  success: false, 
  error: "Message descriptif" 
}, { status: 400 });
```

---

## 🔒 Règle #6 : Un Composant = Un Fichier

```
❌ components/Forms.tsx (plusieurs composants)
✅ components/LoginForm.tsx
✅ components/RegisterForm.tsx
```

---

## 🔒 Règle #7 : Workflow par Tâche

```markdown
POUR CHAQUE tâche dans phase-XX.md :

1. LIRE la tâche et son critère de validation
2. CODER le minimum requis
3. VÉRIFIER que le critère est atteint
4. COCHER la tâche [x]
5. PASSER à la tâche suivante

NE JAMAIS sauter de tâches.
NE JAMAIS coder plusieurs tâches en une fois.
```

---

## � Règle #8 : Mise à jour EXPOSÉ (AUTOMATIQUE)

> **OBLIGATOIRE** : Après chaque phase terminée, mettre à jour BlaizBot-projet.

### Déclencheurs automatiques

| Événement | Action |
|:----------|:-------|
| Phase X terminée (après REFACTOR CHECKPOINT) | Exécuter EXPOSÉ CHECKPOINT |
| Bug corrigé important | Ajouter en section "Gestion bugs" |
| Décision technique majeure | Documenter dans chapitre concerné |
| Fin de session | Mettre à jour métriques |

### Procédure EXPOSÉ CHECKPOINT

```markdown
1. OUVRIR  BlaizBot-projet/progress.json
2. INCRÉMENTER  metrics.developmentHours (durée phase)
3. METTRE À JOUR  chapter[08].status si avancement
4. AJOUTER  dans content/08-developpement.md :
   - Résumé phase terminée
   - Problèmes rencontrés
   - Solutions appliquées
5. SI capture requise :
   - Prendre screenshot
   - Sauver dans assets/screenshots/phase-XX-*.png
6. COMMIT dans BlaizBot-projet
```

### Conventions de nommage captures

```
BlaizBot-projet/assets/screenshots/
├── phase-01-hello.png           # Obligatoire : Hello World + Button
├── phase-02-layout.png          # Obligatoire : Sidebar + Header
├── phase-03-slice.png           # Obligatoire : Dashboard mocké
├── phase-04-prisma.png          # Obligatoire : Prisma Studio
├── phase-05-auth.png            # Obligatoire : Login form
├── phase-05-auth-redirect.gif   # Optionnel : Flow redirect
├── phase-06-admin.png           # Obligatoire : Dashboard admin
├── phase-07-teacher.png         # Obligatoire : Dashboard prof
├── phase-08-student.png         # Obligatoire : Dashboard élève
├── phase-09-ai-chat.gif         # Obligatoire : Chat streaming
└── phase-10-demo.mp4            # Optionnel : Vidéo démo
```

**Règles** :
- Format : `phase-XX-[description].[png|gif|mp4]`
- PNG pour screenshots statiques
- GIF pour animations courtes (<10s)
- MP4 pour démos longues
- Résolution : 1280x720 minimum

### Mapping Phases → Chapitres

| Phase BlaizBot-V1 | Chapitre exposé | Contenu à ajouter |
|:------------------|:----------------|:------------------|
| Phase 1-3 (Init, Layout, Slice) | 08-developpement.md | Setup + premiers composants |
| Phase 4 (Database) | 08-developpement.md | Prisma + Vercel Postgres |
| Phase 5 (Auth) | 08-developpement.md | NextAuth + RBAC |
| Phase 6-8 (Admin/Prof/Élève) | 08-developpement.md | Interfaces métier |
| Phase 9 (IA) | 08-developpement.md | Intégration OpenAI/Claude |
| Phase 10 (Démo) | 09-demo-stabilisation.md | Tests + polish |
| Fin projet | 10-analyse-resultats.md | Métriques finales |

### Template de mise à jour

```markdown
### Phase X — [Nom] (Date)

**Durée** : Xh  
**Tâches** : X/X complétées

**Résumé** :
- Point clé 1
- Point clé 2

**Difficultés** :
- Problème → Solution

**Captures** : `phase-XX-*.png`
```

---

## �📚 Sources de Vérité

| Besoin | Fichier à consulter |
|:-------|:--------------------|
| UI/UX | `blaizbot-wireframe/` |
| Écrans | `docs/03-CARTOGRAPHIE_UI.md` |
| Modèle BDD | `docs/04-MODELE_DONNEES.md` |
| Routes API | `docs/05-API_ENDPOINTS.md` |
| Composants | `docs/06-COMPOSANTS_UI.md` |

---

*Ces règles sont NON NÉGOCIABLES.*
