# 🎓 Phase 8 — Interface Élève (Suite)

> **Suite de** : [phase-08-student.md](phase-08-student.md)
> **Étapes** : 8.4 → 8.7 (Révisions, Agenda, Messages, Profil)

---

## 📋 Étape 8.4 — Mes Révisions

### 🎯 Objectif
Page listant les fiches de révision générées par l'IA (placeholder pour Phase 9).

### 📝 Comment
Créer la structure UI maintenant, la génération IA sera ajoutée en Phase 9.

### 🔧 Par quel moyen
- API de lecture des fiches existantes
- Card avec titre, matière, date
- Modal ou page détail pour voir la fiche

| # | Tâche | Fichier | Validation |
|:--|:------|:--------|:-----------|
| 8.4.1 | Page | `student/revisions/page.tsx` | Page révisions |
| 8.4.2 | API | `GET /api/student/revisions` | Liste fiches |
| 8.4.3 | Card | `RevisionCard.tsx` | < 80 lignes |
| 8.4.4 | Viewer | `RevisionViewer.tsx` | < 150 lignes |
| 8.4.5 | Empty State | Message si pas de fiches | Placeholder IA |

### 💡 INSTRUCTION 8.4 (Mes Révisions)

```markdown
## Contexte
Les fiches de révision seront générées par l'IA en Phase 9.
Pour l'instant, on crée la structure UI.

## Ta mission
1. Table Prisma `Revision` (si pas existante) :
   - id, title, content, subjectId, userId, createdAt

2. API `GET /api/student/revisions` :
   - Lister les fiches de l'élève connecté
   - Inclure la matière (subject)

3. `RevisionCard` :
   - Titre de la fiche
   - Badge matière
   - Date de création
   - Bouton "Voir"

4. `RevisionViewer` :
   - Affichage complet de la fiche (markdown)
   - Bouton retour

5. Empty State :
   - Si aucune fiche : "Aucune fiche générée"
   - Bouton placeholder "Générer une fiche (bientôt)"

## Code de référence
Voir [phase-08-code-suite.md](phase-08-code-suite.md) section 4
```

---

## 📋 Étape 8.5 — Agenda

### 🎯 Objectif
Calendrier affichant les cours, devoirs et examens de l'élève.

### 📝 Comment
Réutiliser le composant calendrier de Phase 7 avec les événements filtrés pour l'élève.

### 🔧 Par quel moyen
- API filtrée par `enrollment.classId`
- Couleurs par type (cours, devoir, exam)
- Click sur jour → détails

| # | Tâche | Fichier | Validation |
|:--|:------|:--------|:-----------|
| 8.5.1 | Page | `student/agenda/page.tsx` | Page agenda |
| 8.5.2 | API | `GET /api/student/agenda` | Événements élève |
| 8.5.3 | Calendar | Réutiliser `AgendaCalendar.tsx` | Composant partagé |
| 8.5.4 | Couleurs | Légende par type | 3 couleurs |
| 8.5.5 | Day Detail | Click jour → modal/panel | Liste événements |

### 💡 INSTRUCTION 8.5 (Agenda)

```markdown
## Contexte
L'élève veut voir son planning : cours, devoirs, examens.

## Ta mission
1. API `GET /api/student/agenda` :
   - Récupérer l'enrollment de l'élève
   - Filtrer les événements par classId
   - Query params : ?month=12&year=2025

2. Composant partagé `AgendaCalendar` :
   - Si créé en Phase 7, le réutiliser
   - Sinon créer dans `src/components/features/shared/`

3. Types d'événements :
   - COURSE (bleu) : cours programmé
   - HOMEWORK (orange) : devoir à rendre
   - EXAM (rouge) : contrôle/examen

4. Interaction :
   - Click sur jour → afficher les événements du jour
   - Panel latéral ou modal

## Layout
┌───────────────────────────────────────┐
│ ◀ Décembre 2025 ▶                     │
├───────────────────────────────────────┤
│ Lun Mar Mer Jeu Ven Sam Dim           │
│  1   2   3   4   5   6   7            │
│  8   9  10• 11  12  13  14            │
│ 15  16  17  18• 19  20  21            │
│ 22  23  24  25  26  27  28            │
│ 29  30  31                            │
├───────────────────────────────────────┤
│ 🔵 Cours  🟠 Devoirs  🔴 Examens      │
└───────────────────────────────────────┘

## Code de référence
Voir [phase-08-code-suite.md](phase-08-code-suite.md) section 5
```

---

## 📋 Étape 8.6 — Messagerie Élève

### 🎯 Objectif
L'élève peut envoyer des messages à ses professeurs.

### 📝 Comment
Réutiliser les composants de messagerie créés en Phase 7.

### 🔧 Par quel moyen
- API filtrée pour l'élève
- Liste des profs contactables (via TeacherAssignment)
- Composants partagés `MessageThread` et `MessageInput`

| # | Tâche | Fichier | Validation |
|:--|:------|:--------|:-----------|
| 8.6.1 | Page | `student/messages/page.tsx` | Page messages |
| 8.6.2 | API GET | `GET /api/student/messages` | Conversations élève |
| 8.6.3 | API POST | `POST /api/student/messages` | Envoyer message |
| 8.6.4 | Teachers List | Liste des profs contactables | Via assignment |
| 8.6.5 | Thread | Réutiliser `MessageThread.tsx` | Composant partagé |
| 8.6.6 | Badge | Messages non lus dans sidebar | Badge visible |

### 💡 INSTRUCTION 8.6 (Messagerie)

```markdown
## Contexte
L'élève veut contacter ses professeurs.
Les composants `MessageThread` et `MessageInput` existent (Phase 7).

## Ta mission
1. API `GET /api/student/messages` :
   - Lister les conversations de l'élève
   - Query param : ?with=userId (filtre par interlocuteur)

2. API `POST /api/student/messages` :
   - Body : { receiverId, content }
   - Vérifier que le receiver est un prof de sa classe

3. Liste des profs contactables :
   - Via TeacherAssignment de la classe de l'élève
   - Afficher nom + matière

4. Layout 2 colonnes :
   - Gauche : liste conversations
   - Droite : fil de messages

## Requête Prisma (profs contactables)
const enrollment = await prisma.enrollment.findFirst({
  where: { userId: session.user.id },
  include: { class: { include: { teacherAssignments: { include: { user: true, subject: true } } } } }
});
const teachers = enrollment.class.teacherAssignments.map(ta => ({
  id: ta.user.id,
  name: `${ta.user.firstName} ${ta.user.lastName}`,
  subject: ta.subject.name
}));

## Code de référence
Voir [phase-08-code-suite.md](phase-08-code-suite.md) section 6
```

---

## 📋 Étape 8.7 — Mon Profil

### 🎯 Objectif
Page profil où l'élève voit ses infos et peut changer son mot de passe.

### 📝 Comment
Afficher les infos en lecture seule + formulaire mot de passe.

### 🔧 Par quel moyen
- Card avec infos (nom, email, classe)
- Formulaire changement mot de passe
- API PUT pour mise à jour

| # | Tâche | Fichier | Validation |
|:--|:------|:--------|:-----------|
| 8.7.1 | Page | `student/profile/page.tsx` | Page profil |
| 8.7.2 | Info Card | `ProfileInfoCard.tsx` | < 80 lignes |
| 8.7.3 | Password Form | `PasswordChangeForm.tsx` | < 100 lignes |
| 8.7.4 | API | `PUT /api/student/profile` | MAJ mot de passe |
| 8.7.5 | Validation | Vérifier ancien mot de passe | Sécurité |
| 8.7.6 | Toast | Message succès/erreur | Feedback |

### 💡 INSTRUCTION 8.7 (Mon Profil)

```markdown
## Contexte
L'élève veut voir son profil et potentiellement changer son mot de passe.

## Ta mission
1. API `GET` (déjà dans session) :
   - Infos depuis session.user

2. API `PUT /api/student/profile` :
   - Body : { currentPassword, newPassword }
   - Vérifier l'ancien mot de passe (bcrypt.compare)
   - Hasher le nouveau (bcrypt.hash)

3. `ProfileInfoCard` :
   - Nom complet
   - Email
   - Classe (via enrollment)
   - Avatar (si implémenté)

4. `PasswordChangeForm` :
   - Input : Mot de passe actuel
   - Input : Nouveau mot de passe
   - Input : Confirmer nouveau
   - Bouton Sauvegarder

## Validation côté client
- Nouveau mot de passe ≥ 8 caractères
- Confirmation = nouveau
- Toast succès/erreur

## Code de référence
Voir [phase-08-code-suite.md](phase-08-code-suite.md) section 7
```

---

### 🧪 TEST CHECKPOINT 8.A — Validation Interface Élève

> ⚠️ **OBLIGATOIRE** : Parcours élève complet

| Test | Commande | Résultat attendu |
|:-----|:---------|:-----------------|
| Build | `npm run build` | ✅ No errors |
| Lint | `npm run lint` | ✅ No warnings |
| TypeScript | `npx tsc --noEmit` | ✅ Clean |

**Tests fonctionnels** :
- [ ] Dashboard → KPIs + progression affichés
- [ ] Mes Cours → liste filtrée par classe
- [ ] Détail cours → chapitres + contenu markdown
- [ ] Marquer chapitre terminé → progression MAJ
- [ ] Révisions → empty state (placeholder IA)
- [ ] Agenda → événements affichés
- [ ] Messagerie → envoyer/recevoir messages
- [ ] Profil → changer mot de passe

**Tests sécurité** :
- [ ] Élève voit seulement ses cours (sa classe)
- [ ] Impossible de voir progression d'un autre élève
- [ ] Messages uniquement avec ses profs

---

### 🔄 REFACTOR CHECKPOINT 8.B — Vérification standards

> 📏 **Règle** : Aucun fichier > 350 lignes

```powershell
# Vérifier les fichiers trop longs
Get-ChildItem -Path src -Recurse -Include *.tsx,*.ts | `
  ForEach-Object { $lines = (Get-Content $_).Count; if($lines -gt 350) { "$($_.Name): $lines lignes" } }
```

**Factorisation** :
- [ ] `MessageThread` partagé entre Teacher et Student ✓
- [ ] `CourseCard` réutilisable ✓
- [ ] `ProgressBar` dans `ui/` ✓

**Nettoyage** :
- [ ] Supprimer composants dupliqués
- [ ] Types partagés dans `types/`
- [ ] Console.log supprimés

---

### 📝 EXPOSÉ CHECKPOINT 8.C — Mise à jour BlaizBot-projet

> 📚 **OBLIGATOIRE** : Documenter l'avancement après chaque phase

| Tâche | Action | Fichier cible |
|:------|:-------|:--------------|
| 8.C.1 | Incrémenter `developmentHours` (+7h) | `progress.json` |
| 8.C.2 | Ajouter résumé Phase 8 | `content/08-developpement.md` |
| 8.C.3 | Capturer dashboard élève | `assets/screenshots/phase-08-student.png` |
| 8.C.4 | Commit BlaizBot-projet | `git commit -m "docs: phase 8 student"` |

**Template à ajouter dans 08-developpement.md** :
```markdown
### Phase 8 — Interface Élève (DATE)

**Durée** : 7h  
**Tâches** : X/X complétées

**Résumé** :
- Dashboard Élève avec progression et activité récente
- Liste "Mes Cours" avec filtres et progression
- Vue détail cours avec contenu et documents
- Agenda avec vue calendrier
- Messagerie élève ↔ profs

**Captures** : `phase-08-student.png`
```

---

## 📸 Captures requises

- [ ] Screenshot dashboard élève complet
- [ ] Screenshot liste "Mes Cours"
- [ ] Screenshot détail d'un cours

---

## ✅ Checklist fin de phase

- [ ] Dashboard Élève avec 3 KPIs et 2 widgets
- [ ] Liste "Mes Cours" avec progression et filtres
- [ ] Vue détail cours avec contenu markdown et documents
- [ ] Page "Mes Révisions" (placeholder IA)
- [ ] Agenda avec vue calendrier et légende
- [ ] Messagerie élève ↔ profs
- [ ] Page profil avec modification password
- [ ] Aucun fichier > 350 lignes
- [ ] Composants partagés réutilisés (MessageThread, etc.)

---

## 🔄 Navigation

← [phase-08-student.md](phase-08-student.md) | [phase-09-ai.md](phase-09-ai.md) →

---

*Lignes : ~280 | Dernière MAJ : 2025-12-22*
