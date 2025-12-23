# Instructions pour Claude Code

> Ce fichier est lu automatiquement par l'extension Claude Code dans VS Code.

## 🎯 Contexte Projet

**BlaizBot V1** - Plateforme éducative avec IA intégrée.

| Info | Valeur |
|:-----|:-------|
| Stack | Next.js 15, TypeScript, Tailwind, Prisma |
| BDD | Vercel Postgres (Neon) |
| Auth | NextAuth.js v5 (Admin, Teacher, Student) |
| IA | OpenAI / Claude / Gemini via Vercel AI SDK |

## 📁 Structure Importante

```
src/
├── app/           # Next.js App Router
│   ├── (auth)/    # Routes publiques (login)
│   ├── (dashboard)/ # Routes protégées
│   └── api/       # API Routes
├── components/    # React components
│   ├── ui/        # shadcn/ui
│   └── features/  # Composants métier
└── lib/           # Utilitaires (prisma, auth, ai)

todo/              # 📋 Tâches micro-détaillées par phase
docs/              # 📚 Documentation technique
prisma/            # 🗄️ Schéma BDD
```

## ⚠️ Règles CRITIQUES

1. **≤ 350 lignes par fichier** - Découper si plus long
2. **Zéro secrets en dur** - Utiliser `.env.local`
3. **TypeScript strict** - Pas de `any`, types explicites
4. **Commits atomiques** - `feat:`, `fix:`, `docs:`, `refactor:`

## 🔧 Commandes Utiles

```bash
npm run dev          # Démarrer le serveur
npm run lint         # Vérifier le code
npm run build        # Build production
npx prisma studio    # Voir la BDD
npx prisma migrate dev # Appliquer migrations
```

## 📋 Workflow de Développement

1. **Consulter** `todo/INDEX.md` → Phase active
2. **Lire** la tâche détaillée dans `todo/phase-XX-*.md`
3. **Coder** en micro-étapes (1 fichier à la fois)
4. **Tester** avec les checkpoints
5. **Commit** atomique

## 🎨 Wireframe de Référence (CRITIQUE)

**TOUJOURS consulter** `blaizbot-wireframe/` avant de coder l'UI :

| Fichier | Contenu | Usage |
|:--------|:--------|:------|
| `student.html` + `student.js` | Dashboard élève complet | Référence pour toutes les pages élève |
| `teacher.html` + `teacher.js` | Dashboard professeur | Référence pour toutes les pages prof |
| `admin.html` + `admin.js` | Dashboard admin | Référence pour toutes les pages admin |
| `js/modules/` | Modules fonctionnels | Logique métier de référence |
| `data/mockData.js` | Données de test | Structure des objets |

### Comment utiliser le wireframe
1. **Ouvrir** le fichier HTML correspondant dans un navigateur
2. **Inspecter** les interactions (JS) et le layout (CSS)
3. **Traduire** en composants React avec les mêmes comportements
4. **Réutiliser** les mockData pour les tests

## 📊 Sources de Vérité

| Priorité | Source | Contenu |
|:---------|:-------|:--------|
| 🥇 | `blaizbot-wireframe/` | UI, comportements, mockData |
| 🥈 | `docs/03-CARTOGRAPHIE_UI.md` | Inventaire des écrans |
| 🥉 | `docs/04-MODELE_DONNEES.md` | Schéma Prisma |
| 4️⃣ | `docs/05-API_ENDPOINTS.md` | Routes API |

## 🚫 Interdits

- ❌ Fichiers > 350 lignes
- ❌ Secrets/tokens en dur
- ❌ `git reset --hard`
- ❌ Modifier plusieurs fichiers sans lien logique
- ❌ Ignorer le wireframe pour l'UI
