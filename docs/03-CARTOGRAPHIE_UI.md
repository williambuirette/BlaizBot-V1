# 🏗️ Cartographie Complète de l'Interface - BlaizBot V1

> **Document** : 03/10 - Inventaire exhaustif de toutes les pages, sections, modales et boutons
> **Statut** : 🟡 En cours
> **Source** : Analyse du wireframe `blaizbot-wireframe`

---

## 📊 Vue d'Ensemble

| Interface | Sections | Modales | Fonctionnalités clés |
|-----------|----------|---------|---------------------|
| **Connexion** | 1 | 0 | Login, sélection rôle |
| **Élève** | 8 | 4 | Dashboard, IA, Lab, Messagerie |
| **Professeur** | 8 | 2 | Gestion cours, suivi élèves |
| **Admin** | 9 | 6 | CRUD complet, paramètres IA |

---

## 🔐 PAGE : CONNEXION (`index.html`)

### Description
Page d'entrée de l'application avec authentification.

### Éléments UI
| Élément | Type | Action |
|---------|------|--------|
| Champ Email/Identifiant | Input text | Saisie login |
| Champ Mot de passe | Input password | Saisie password |
| Bouton "Se connecter" | Button primary | Authentification → Redirection par rôle |

### Comportement
- **Succès** : Redirection vers dashboard selon rôle (student/teacher/admin)
- **Échec** : Message d'erreur
- **Session** : JWT stocké, vérification à chaque route protégée

---

## 👨‍🎓 INTERFACE : ÉLÈVE (`student.html`)

### Navigation (Sidebar)
```
MON PARCOURS
├── Ma Progression (dashboard)
├── Mes Cours
├── Mes Exercices
└── Centre de Communication (badge: compteur)

ASSISTANCE IA
├── Mon Assistant IA (Blaiz'bot)
├── Blaiz'bot Lab (Libre)
├── Base de connaissances
└── Planning de Révision
```

---

### SECTION 1 : Ma Progression (`section-dashboard`)

#### Description
Dashboard principal avec KPIs et dernières notes.

#### Composants
| Composant | Données | Actions |
|-----------|---------|---------|
| Card "Progression Globale" | % progression + barre | - |
| Card "Moyenne Actuelle" | Note /20 | - |
| Card "À faire aujourd'hui" | Liste devoirs | Liens vers exercices |
| Table "Dernières Notes" | Matière, Évaluation, Note, Commentaire IA | - |

#### API nécessaires
- `GET /api/student/progression`
- `GET /api/student/grades`
- `GET /api/student/todos`

---

### SECTION 2 : Mes Cours (`section-cours`)

#### Description
Accès aux supports de cours par matière.

#### Composants
| Composant | Données | Actions |
|-----------|---------|---------|
| Grid de Cards | Matière, dernier chapitre | Bouton "Ouvrir le cours" |

#### API nécessaires
- `GET /api/student/courses`
- `GET /api/student/courses/:id/content`

---

### SECTION 3 : Mon Assistant IA (`section-chatbot`)

#### Description
Interface de chat contextuel avec l'IA, basée sur les cours du professeur.

#### Vues
1. **Dashboard Assistant** : Liste des cours/environnements du professeur
2. **Workspace Assistant** : Interface 3 colonnes

#### Layout Workspace (3 colonnes)
| Colonne | Contenu |
|---------|---------|
| **Sources** (280px) | Sources Prof (🔒 verrouillées) + Mes Sources |
| **Chat** (flex) | Sélecteur matière/thème + Messages + Input |
| **Outils** (300px) | Boutons génération (Quiz, Méthode, Résumé, Expliquer) |

#### Fonctionnalités IA
| Bouton | Action IA |
|--------|-----------|
| 📝 Générer un Quiz | Génère quiz basé sur sources |
| 🧠 Méthode de révision | Plan personnalisé |
| 📄 Résumé du cours | Fiche synthèse |
| ❓ Expliquer l'exercice | Aide contextuelle |

#### API nécessaires
- `GET /api/student/assistant/courses`
- `POST /api/ai/chat` (streaming)
- `POST /api/ai/generate/quiz`
- `POST /api/ai/generate/summary`
- `POST /api/student/sources` (upload)

---

### SECTION 4 : Blaiz'bot Lab (`section-lab`)

#### Description
Studio de recherche libre (style NotebookLM). L'élève importe ses propres sources.

#### Vues
1. **Dashboard** : Grille de projets + bouton "Nouveau Projet"
2. **Workspace** : Interface 3 colonnes

#### Layout Workspace (3 colonnes)
| Colonne | Contenu |
|---------|---------|
| **Sources** (300px) | Fichiers, liens web, vidéos YouTube |
| **Chat** (flex) | Chat avec l'IA sur les sources |
| **Espace de travail** (320px) | Génération : Synthèse, Quiz, Flashcards, Carte Mentale |

#### Modales
| Modale | Champs |
|--------|--------|
| Création Projet | Titre du projet |
| Configuration Génération | Prompt contextuel (textarea) |

#### API nécessaires
- `GET /api/student/lab/projects`
- `POST /api/student/lab/projects`
- `POST /api/student/lab/projects/:id/sources`
- `POST /api/ai/chat` (avec context sources)
- `POST /api/ai/generate/flashcards`
- `POST /api/ai/generate/mindmap`

---

### SECTION 5 : Base de Connaissances (`section-knowledge`)

#### Description
Bibliothèque de ressources : base prof (lecture seule) + base perso (CRUD).

#### Onglets
1. **Base Professeur** : Matières → Thèmes → Documents (🔒)
2. **Ma Base Perso** : Mes matières → Mes thèmes → Mes fiches

#### Layout (2 colonnes)
| Colonne | Contenu |
|---------|---------|
| Sidebar (250px) | Liste matières |
| Contenu (flex) | Thèmes et documents |

#### API nécessaires
- `GET /api/student/knowledge/teacher`
- `GET /api/student/knowledge/personal`
- `POST /api/student/knowledge/subjects`
- `POST /api/student/knowledge/documents`

---

### SECTION 6 : Centre de Communication (`section-messages`)

#### Description
Messagerie organisée par Matière → Thème → Type (Groupe/Prof).

#### Structure
```
📢 Chat de Classe (Général)
📐 Mathématiques
  └── 📘 Thème : Les Fractions
       ├── 📢 Chat de groupe
       └── 👤 M. DUPONT (Prof)
  └── 📘 Thème : Géométrie
       └── 👤 M. DUPONT (Prof)
✍️ Français
  └── 📘 Thème : La Poésie
       └── 👤 Mme. MARTIN (Prof)
```

#### Layout (2 colonnes)
| Colonne | Contenu |
|---------|---------|
| Liste conversations (flex:1) | Arborescence matière/thème |
| Fenêtre chat (flex:2.5) | Header + Messages + Input |

#### API nécessaires
- `GET /api/student/messages/conversations`
- `GET /api/student/messages/:conversationId`
- `POST /api/student/messages/:conversationId`
- WebSocket pour temps réel

---

### SECTION 7 : Mes Exercices (`section-exercices`)

#### Description
Liste des quiz et exercices assignés.

#### Composants
| Composant | Données | Actions |
|-----------|---------|---------|
| Cards exercices | Titre, Statut (Réussi/À faire), Score, Date limite | "Commencer" / "Revoir" |

#### API nécessaires
- `GET /api/student/exercises`
- `GET /api/student/exercises/:id`
- `POST /api/student/exercises/:id/submit`

---

### SECTION 8 : Planning de Révision (`section-revisions`)

#### Description
Calendrier avec événements professeur + objectifs personnels.

#### Composants
| Composant | Description |
|-----------|-------------|
| Navigation mois | Boutons ◀ ▶ + Titre mois/année |
| Légende | Points colorés (Prof = bleu, Perso = vert) |
| Grille calendrier | 7 colonnes (Lun-Dim) |

#### Modales
| Modale | Champs |
|--------|--------|
| Nouvel Événement | Titre, Date début/fin, Heure début/fin, Description |

#### API nécessaires
- `GET /api/student/calendar/events`
- `POST /api/student/calendar/events`
- `PUT /api/student/calendar/events/:id`
- `DELETE /api/student/calendar/events/:id`

---

## 👨‍🏫 INTERFACE : PROFESSEUR (`teacher.html`)

### Navigation (Sidebar)
```
MON ACTIVITÉ
├── Tableau de bord
├── Mes Matières
├── Mes Classes
├── Mes Élèves
├── Mes Cours & Contenus
├── Gestion des Attributions
├── Planning & Agenda
└── Messagerie (badge: compteur)
```

---

### SECTION 1 : Tableau de bord (`section-dashboard`)

#### Description
Analytics pédagogique avec KPIs, alertes IA, recommandations.

#### Composants
| Composant | Données |
|-----------|---------|
| Filtres | Sélecteur classe, sélecteur élève |
| Card "Taux de Compréhension" | % + barre |
| Card "Engagement Élèves" | % actifs cette semaine |
| Card "Alertes IA Prioritaires" | Nombre (rouge) |
| Card "Temps Moyen / Cours" | Minutes |
| Panel "Performance des Cours" | Top compris + À revoir |
| Panel "Assistant Pédagogique Blaiz'bot" | Suggestions IA |
| Table "Alertes de progression" | Élève, Classe, Sujet, Diagnostic IA, Urgence |

#### API nécessaires
- `GET /api/teacher/dashboard/stats`
- `GET /api/teacher/dashboard/alerts`
- `GET /api/teacher/dashboard/recommendations`

---

### SECTION 2 : Mes Matières (`section-matieres`)

#### Description
Liste des matières enseignées (lecture seule, défini par admin).

#### Table
| Colonne | Description |
|---------|-------------|
| Matière | Nom |
| Nombre de classes | Compteur |
| Volume horaire hebdo | Heures |
| Actions | Voir détails |

---

### SECTION 3 : Mes Classes (`section-classes`)

#### Description
Cards des classes avec stats.

#### Composants
| Composant | Données | Actions |
|-----------|---------|---------|
| Card classe | Nom, Tag matière, Nb élèves, Moyenne, Barre progression | "Voir la classe" |

#### Modale
| Modale | Contenu |
|--------|---------|
| Détails Classe | Liste élèves avec stats individuelles |

---

### SECTION 4 : Mes Cours & Contenus (`section-cours`)

#### Description
Gestionnaire de fichiers avec explorateur arborescent + configuration IA.

#### Layout (2 colonnes)
| Colonne | Contenu |
|---------|---------|
| Explorateur (flex:1) | Arborescence dossiers/fichiers |
| Détails (flex:2) | Preview + Config IA |

#### Actions Header
- 📁 Nouveau Dossier
- 📝 Créer un Cours
- 📤 Charger un document

#### Panel Config IA
| Champ | Type |
|-------|------|
| Objectif pédagogique | Textarea |
| Types d'exercices autorisés | Checkboxes (Quiz, Application, Étude de cas, etc.) |

#### API nécessaires
- `GET /api/teacher/courses/tree`
- `POST /api/teacher/courses/folders`
- `POST /api/teacher/courses/files` (upload)
- `PUT /api/teacher/courses/:id/ai-config`

---

### SECTION 5 : Gestion des Attributions (`section-attributions`)

#### Description
Distribution des contenus aux classes/élèves.

#### Table
| Colonne | Description |
|---------|-------------|
| Contenu | Nom du document |
| Cible | Badge Classe ou Élève |
| Date d'attribution | Date |
| Échéance | Date ou "-" |
| Statut IA | Actif/Terminé |
| Actions | Modifier, Supprimer |

#### Modale
| Modale | Champs |
|--------|--------|
| Nouvelle Attribution | Contenu (select), Cible (classe/élève), Échéance |

---

### SECTION 6 : Mes Élèves (`section-eleves`)

#### Description
Suivi individuel avec filtres.

#### Filtres
- Sélecteur classe
- Sélecteur élève (alphabétique)
- Bouton "Analyser l'élève"

#### Table
| Colonne | Description |
|---------|-------------|
| Nom | Nom élève |
| Classe | Classe |
| Progression Moyenne | Barre de progression |
| Dernière Interaction IA | Date/heure |
| Actions | Voir détails |

#### Panel Détails Élève
- Graphique progression
- Historique interactions IA
- Recommandations personnalisées

---

### SECTION 7 : Planning & Agenda (`section-planning`)

#### Description
Calendrier professeur avec cours, évaluations, réunions.

*(Similaire au calendrier élève avec plus de fonctionnalités)*

---

### SECTION 8 : Messagerie (`section-messages`)

#### Description
Communication avec élèves et classes.

*(Structure similaire à la messagerie élève mais côté émetteur)*

---

## ⚙️ INTERFACE : ADMIN (`admin.html`)

### Navigation (Sidebar)
```
ORGANISATION
├── Matières
├── Classes / Niveaux
├── Professeurs
└── Élèves

PÉDAGOGIE
└── Programmes

PILOTAGE
└── Statistiques

SÉCURITÉ
└── Utilisateurs

CONFIGURATION
└── Paramètres IA
```

---

### SECTION 1 : Matières (`section-matieres`)

#### Description
CRUD des matières de l'établissement.

#### Actions
- Filtre recherche
- Bouton "+ Créer une Matière"

#### Table
| Colonne | Actions |
|---------|---------|
| Nom de la Matière | Modifier, Supprimer |

#### Modale
| Champ | Type |
|-------|------|
| Nom de la matière | Input text |

---

### SECTION 2 : Classes / Niveaux (`section-classes`)

#### CRUD des classes.

#### Table
| Colonne | Description |
|---------|-------------|
| Nom de la Classe | ex: 6ème A |
| Niveau | ex: 6ème |
| Actions | Modifier, Supprimer |

#### Modale
| Champ | Type |
|-------|------|
| Nom de la classe | Input |
| Niveau | Input |

---

### SECTION 3 : Professeurs (`section-professeurs`)

#### CRUD complet des professeurs avec références croisées.

#### Table
| Colonnes |
|----------|
| Nom, Prénom, Email, Matières (tags), Classes Assignées, Statut, Actions |

#### Modale Complète
| Section | Champs |
|---------|--------|
| Identité | Civilité, Nom, Prénom, Date naissance |
| Contact | Email |
| Matières | Checkboxes (lié à section Matières) |
| Classes | Checkboxes (lié à section Classes) |

---

### SECTION 4 : Élèves (`section-eleves`)

#### CRUD des élèves.

#### Table
| Colonnes |
|----------|
| Nom, Prénom, Classe, Matières (tags), Email Élève, Email Parent, Actions |

#### Modale
| Section | Champs |
|---------|--------|
| Identité | Nom, Prénom |
| Affectation | Classe (select) |
| Contact | Email Élève, Email Parent |
| Matières | Checkboxes |

---

### SECTION 5 : Programmes (`section-programmes`)

#### Gestion des programmes pédagogiques avec base de connaissances.

#### Table
| Colonnes |
|----------|
| Nom, Thème, Niveau, Matière, Base de Connaissances (Complète/À compléter), Actions |

#### Modale
| Section | Champs |
|---------|--------|
| Info | Nom du Programme, Thème principal |
| Affectation | Niveau (select), Matière (select) |
| Contenu | Base de connaissances (textarea) |
| Direction | Directives (textarea) |
| Fichiers | Zone de dépôt drag & drop |

---

### SECTION 6 : Statistiques (`section-statistiques`)

#### Analytics global de l'établissement.

#### Filtres
- Par Classe
- Par Professeur
- Par Élève
- Par Matière

#### Composants
| Composant | Données |
|-----------|---------|
| Card Performance Élèves | Moyenne, taux réussite, progression, % difficulté |
| Card Performance Professeurs | % complétion, supports déposés, assiduité |
| Card Résultats par Matière | Mini graphique barres |
| Table Top Performances | Élève, Classe, Moyenne, Progression |

---

### SECTION 7 : Utilisateurs (`section-utilisateurs`)

#### Gestion des comptes et sécurité.

#### Table
| Colonnes |
|----------|
| Utilisateur, Rôle (tag), Email, Dernière Connexion, Statut, Actions |

#### Actions
- Modifier
- Réinitialiser mot de passe
- Supprimer

#### Modale Complète
| Section | Champs |
|---------|--------|
| Compte | Identifiant, Rôle système |
| Identité | Civilité, Nom, Prénom |
| Adresse | Rue, CP, Ville |
| Contact | Téléphone, Email |
| Parents (si élève) | Tel Parents, Email Parents |
| Sécurité | Mot de passe, Confirmation, Checkbox actif |

---

### SECTION 8 : Paramètres IA (`section-settings`)

#### Configuration globale de l'IA.

#### Panel Connexion API
| Champ | Description |
|-------|-------------|
| Fournisseur | Select (OpenAI, Google, Anthropic, Mistral, Custom) |
| Clé API | Input password |
| Endpoint (si custom) | Input URL |
| Modèle | Input text |

#### Actions
- Enregistrer la configuration
- Tester la connexion

#### Panel Paramètres Application
| Champ | Type |
|-------|------|
| Nom de la Plateforme | Input |
| Langue par défaut | Select |
| Niveau de restriction IA | Select (Strict, Équilibré, Créatif) |
| Analyse automatique PDF | Checkbox |
| Professeurs modifient prompts | Checkbox |
| Mode maintenance | Checkbox |

---

## 📱 Composants UI Réutilisables Identifiés

| Composant | Usage |
|-----------|-------|
| `Sidebar` | Navigation latérale avec groupes |
| `StatsCard` | Card avec titre, valeur, description, barre |
| `DataTable` | Table avec tri, filtre, pagination |
| `Modal` | Overlay avec header, body, footer |
| `ChatInterface` | Messages + Input + Actions |
| `FileExplorer` | Arborescence dossiers/fichiers |
| `Calendar` | Grille calendrier avec événements |
| `TabSwitcher` | Onglets |
| `Badge` | Compteur notifications |
| `ProgressBar` | Barre de progression |
| `Tag` | Label coloré |
| `StatusPill` | Statut (Actif, Terminé, etc.) |

---

## ✅ Validation

Ce document est-il complet ? Manque-t-il des éléments du wireframe ?
