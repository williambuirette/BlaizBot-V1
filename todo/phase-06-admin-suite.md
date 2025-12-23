# 👔 Phase 6 — Interface Admin (Partie 2)

> **Suite de** : [phase-06-admin.md](phase-06-admin.md) (étapes 6.1→6.4)
> **Ce fichier** : Étapes 6.5→6.8 (Matières, Affectations, Settings)
> **Code** : [phase-06-code.md](phase-06-code.md) et [phase-06-code-suite.md](phase-06-code-suite.md)

---

## 📋 Étape 6.5 — CRUD Matières (Subjects)

### 🎯 Objectif
Gérer les matières avec couleur personnalisée pour les badges.

### 📝 Comment
Même pattern CRUD + color picker pour le champ couleur.

### 🔧 Par quel moyen
- API : `/api/admin/subjects`
- Champs : `name`, `color` (hex code)
- UI : Input type="color" ou preset de couleurs

---

### Tâche 6.5.1 — API Subjects

| Critère | Attendu |
| :--- | :--- |
| Route | `src/app/api/admin/subjects/route.ts` |
| GET | Liste des matières |
| POST | Créer avec name + color |

💡 **INSTRUCTION pour l'IA** :
```
1. CRÉER: src/app/api/admin/subjects/route.ts
2. GET: prisma.subject.findMany({ orderBy: { name: 'asc' } })
3. POST:
   const { name, color } = await req.json();
   // Vérifier unicité du nom
   // Valider color format hex (#xxxxxx)
   prisma.subject.create({ data: { name, color } })
4. CRÉER aussi [id]/route.ts pour PUT/DELETE
```

---

### Tâche 6.5.2 — UI Subjects avec Color Picker

| Critère | Attendu |
| :--- | :--- |
| Table | Affiche badge coloré |
| Form | Sélection de couleur |

💡 **INSTRUCTION pour l'IA** :
```
1. DANS SubjectsTable.tsx:
   - Colonne "Matière" avec badge coloré:
     <span style={{ backgroundColor: subject.color }}>
       {subject.name}
     </span>

2. DANS SubjectFormModal.tsx:
   - Input color avec preset de couleurs:
     const colorPresets = [
       '#3b82f6', // blue
       '#8b5cf6', // violet
       '#10b981', // green
       '#f59e0b', // amber
       '#ef4444', // red
       '#ec4899', // pink
     ];
   - Afficher les preset + input type="color" custom
```

---

## 📋 Étape 6.6 — Affectations Prof → Classe (TeacherAssignment)

### 🎯 Objectif
Assigner un professeur à une classe pour une matière spécifique.

### 📝 Comment
1. Créer l'API pour TeacherAssignment
2. UI avec 3 selects : Prof, Classe, Matière
3. Table des affectations existantes

### 🔧 Par quel moyen
- Modèle : `TeacherAssignment` (userId, classId, subjectId)
- Contrainte : Un prof ne peut pas être affecté 2x à la même classe/matière
- UI : Page dédiée ou section dans settings

---

### Tâche 6.6.1 — API Assignments

| Critère | Attendu |
| :--- | :--- |
| GET | Liste avec relations (prof.name, class.name, subject.name) |
| POST | Créer affectation (vérifier unicité) |
| DELETE | Supprimer affectation |

💡 **INSTRUCTION pour l'IA** :
```
1. CRÉER: src/app/api/admin/assignments/route.ts
2. GET avec includes:
   const assignments = await prisma.teacherAssignment.findMany({
     include: {
       user: { select: { name: true, email: true } },
       class: { select: { name: true, level: true } },
       subject: { select: { name: true, color: true } },
     },
   });

3. POST:
   - Vérifier que userId est bien un TEACHER
   - Vérifier unicité (userId + classId + subjectId)
   - prisma.teacherAssignment.create()

4. DELETE: [id]/route.ts
```

---

### Tâche 6.6.2 — UI Assignments

| Critère | Attendu |
| :--- | :--- |
| Page | `admin/assignments/page.tsx` |
| Form | 3 selects (Prof, Classe, Matière) |
| Table | Liste des affectations |

💡 **INSTRUCTION pour l'IA** :
```
1. CRÉER: src/app/admin/assignments/page.tsx
2. FETCH au mount:
   - Tous les teachers (pour select)
   - Toutes les classes (pour select)
   - Toutes les matières (pour select)
   - Toutes les affectations (pour table)

3. FORM:
   <div className="flex gap-4">
     <Select placeholder="Professeur" value={teacherId} onChange={...} />
     <Select placeholder="Classe" value={classId} onChange={...} />
     <Select placeholder="Matière" value={subjectId} onChange={...} />
     <Button onClick={handleAssign}>Affecter</Button>
   </div>

4. TABLE:
   | Professeur | Classe | Matière | Actions |
   | M. Dupont  | 3ème A | Maths   | 🗑️      |

5. CODE: Voir [phase-06-code-suite.md](phase-06-code-suite.md) section 2
```

---

## 📋 Étape 6.7 — Inscriptions Élève → Classe (Enrollment)

### 🎯 Objectif
Inscrire des élèves dans des classes.

### 📝 Comment
1. API pour Enrollment
2. Vue par classe avec liste d'élèves
3. Bouton pour ajouter/retirer un élève

### 🔧 Par quel moyen
- Modèle : `Enrollment` (userId, classId)
- Contrainte : Un élève ne peut être inscrit qu'à une classe
- UI : Page avec select classe puis liste élèves

---

### Tâche 6.7.1 — API Enrollments

| Critère | Attendu |
| :--- | :--- |
| GET | Liste par classe |
| POST | Inscrire élève |
| DELETE | Désinscrire élève |

💡 **INSTRUCTION pour l'IA** :
```
1. CRÉER: src/app/api/admin/enrollments/route.ts
2. GET avec query param classId:
   const { searchParams } = new URL(req.url);
   const classId = searchParams.get('classId');
   
   if (classId) {
     // Élèves d'une classe spécifique
     return prisma.enrollment.findMany({
       where: { classId },
       include: { user: { select: { id: true, name: true, email: true } } },
     });
   }
   // Toutes les inscriptions

3. POST:
   - Vérifier que userId est bien un STUDENT
   - Vérifier qu'il n'est pas déjà inscrit ailleurs (optionnel selon règle)
   - prisma.enrollment.create()

4. DELETE: [id]/route.ts
```

---

### Tâche 6.7.2 — UI Enrollments

| Critère | Attendu |
| :--- | :--- |
| Page | `admin/enrollments/page.tsx` |
| Select | Sélectionner une classe |
| Liste | Élèves inscrits dans cette classe |
| Actions | Ajouter / Retirer élève |

💡 **INSTRUCTION pour l'IA** :
```
1. CRÉER: src/app/admin/enrollments/page.tsx
2. WORKFLOW:
   a. Select classe en haut
   b. Quand classe sélectionnée → fetch élèves
   c. Afficher liste avec bouton "Retirer"
   d. Bouton "Ajouter élève" → modal avec select

3. MODAL "Ajouter élève":
   - Fetch students non inscrits (ou tous si multi-classe autorisé)
   - Select student
   - Bouton "Inscrire"

4. AFFICHAGE:
   Classe: [Select: 3ème A ▼]
   
   Élèves (3):
   ┌──────────────┬────────────────────┬─────────┐
   │ Lucas Martin │ lucas@example.com  │  🗑️    │
   │ Emma Dubois  │ emma@example.com   │  🗑️    │
   │ Hugo Moreau  │ hugo@example.com   │  🗑️    │
   └──────────────┴────────────────────┴─────────┘
   [+ Ajouter un élève]
```

---

## 📋 Étape 6.8 — Page Paramètres Admin

### 🎯 Objectif
Page de configuration (placeholder pour futures features).

### 📝 Comment
Créer une page avec sections de settings (mock pour l'instant).

### 🔧 Par quel moyen
- Page statique avec formulaires désactivés
- Sections : Établissement, IA Config (Phase 9), Export

---

### Tâche 6.8.1 — Créer page Settings

| Critère | Attendu |
| :--- | :--- |
| Fichier | `src/app/admin/settings/page.tsx` |
| Sections | 3 cards de settings |
| État | Placeholder (disabled) |

💡 **INSTRUCTION pour l'IA** :
```
1. CRÉER: src/app/admin/settings/page.tsx
2. SECTIONS:
   
   Card 1: "Établissement"
   - Nom de l'établissement (input disabled)
   - Année scolaire (input disabled)
   - Logo (upload disabled)
   - Badge "Coming soon"
   
   Card 2: "Configuration IA"
   - Modèle OpenAI (select disabled)
   - Température (slider disabled)
   - Badge "Phase 9"
   
   Card 3: "Export / Import"
   - Bouton "Exporter données" (disabled)
   - Bouton "Importer CSV" (disabled)
   - Badge "Coming soon"

3. FOOTER: Bouton "Sauvegarder" (disabled)
```

---

### 🧪 TEST CHECKPOINT 6.A — Après tous les CRUD

> ⚠️ **OBLIGATOIRE** : Valider chaque CRUD

| Test | Commande | Résultat attendu |
|:-----|:---------|:-----------------|
| Build | `npm run build` | ✅ No errors |
| Lint | `npm run lint` | ✅ No warnings |
| TypeScript | `npx tsc --noEmit` | ✅ Clean |

**Tests CRUD Users** :
- [ ] Lister tous les users → tableau affiché
- [ ] Créer user → apparait dans liste
- [ ] Modifier user → changement visible
- [ ] Supprimer user → disparaît de la liste

**Tests CRUD Classes** :
- [ ] Lister → Modifier → Supprimer OK

**Tests CRUD Subjects** :
- [ ] Couleur affichée dans badge
- [ ] Color picker fonctionne

**Tests Affectations** :
- [ ] Assigner prof → apparait dans table
- [ ] Inscrire élève → apparait dans classe

---

### 🔄 REFACTOR CHECKPOINT 6.B — Vérification standards

> 📏 **Règle** : Aucun fichier > 350 lignes

```powershell
# Vérifier les fichiers trop longs (CRUD souvent volumineux)
Get-ChildItem -Path src -Recurse -Include *.tsx,*.ts | `
  ForEach-Object { $lines = (Get-Content $_).Count; if($lines -gt 350) { "$($_.Name): $lines lignes" } }
```

**Si fichiers trop longs** :
- [ ] Extraire colonnes table → fichier `columns.tsx`
- [ ] Extraire actions CRUD → hook `useUsersCrud.ts`
- [ ] Extraire modale → fichier `UserFormModal.tsx`
- [ ] Pattern : 1 page, 1 table, 1 modale, 1 hook = 4 fichiers

**Nettoyage API** :
- [ ] Toutes les API retournent `{ success, data }` ou `{ success, error }`
- [ ] Validation Zod sur chaque POST/PUT

---

### 📝 EXPOSÉ CHECKPOINT 6.C — Mise à jour BlaizBot-projet

> 📚 **OBLIGATOIRE** : Documenter l'avancement après chaque phase

| Tâche | Action | Fichier cible |
|:------|:-------|:--------------|
| 6.C.1 | Incrémenter `developmentHours` (+7h) | `progress.json` |
| 6.C.2 | Ajouter résumé Phase 6 | `content/08-developpement.md` |
| 6.C.3 | Documenter pattern CRUD | `content/annexes/B-code-samples.md` |
| 6.C.4 | Capturer dashboard admin | `assets/screenshots/phase-06-admin.png` |
| 6.C.5 | Commit BlaizBot-projet | `git commit -m "docs: phase 6 admin CRUD"` |

**Template à ajouter dans 08-developpement.md** :
```markdown
### Phase 6 — Interface Admin (DATE)

**Durée** : 7h  
**Tâches** : X/X complétées

**Résumé** :
- Dashboard Admin avec KPIs (users, classes, cours)
- CRUD complet Users (créer, modifier, supprimer)
- CRUD Classes et Matières
- Affectation profs ↔ classes
- Inscription élèves ↔ classes

**Pattern utilisé** :
- 1 page + 1 table + 1 modal + 1 hook = CRUD complet

**Captures** : `phase-06-admin.png`
```

---

## 📸 Captures requises

- [ ] Screenshot Dashboard Admin avec KPIs
- [ ] Screenshot CRUD Users (liste + modal édition)
- [ ] Screenshot page Affectations profs
- [ ] Screenshot page Inscriptions élèves

---

## ✅ Checklist fin de phase

| Critère | Vérifié |
| :--- | :--- |
| Dashboard avec 4 KPIs | ⬜ |
| API /api/admin/stats | ⬜ |
| CRUD Users complet | ⬜ |
| CRUD Classes complet | ⬜ |
| CRUD Subjects complet | ⬜ |
| Affectations Prof→Classe | ⬜ |
| Inscriptions Élève→Classe | ⬜ |
| Page Settings (placeholder) | ⬜ |
| Aucun fichier > 350 lignes | ⬜ |
| `npm run lint` OK | ⬜ |
| `npm run build` OK | ⬜ |

---

## 🔄 Navigation

← [phase-06-admin.md](phase-06-admin.md) | [phase-07-teacher.md](phase-07-teacher.md) →

---

*Lignes : ~280 | Dernière MAJ : 2025-12-22*
