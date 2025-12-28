// Messages centralisés pour l'application

export const MESSAGES = {
  errors: {
    unauthorized: 'Non autorisé',
    forbidden: 'Accès interdit',
    notFound: 'Ressource non trouvée',
    serverError: 'Erreur serveur',
    connectionError: 'Erreur de connexion',
    invalidData: 'Données invalides',
    
    // Users
    userNotFound: 'Utilisateur non trouvé',
    emailTaken: 'Cet email est déjà utilisé',
    passwordRequired: 'Le mot de passe est requis',
    cannotDeleteLastAdmin: 'Impossible de supprimer le dernier administrateur',
    cannotDeleteSelf: 'Vous ne pouvez pas supprimer votre propre compte',
    
    // Classes
    classNotFound: 'Classe non trouvée',
    classNameTaken: 'Une classe avec ce nom existe déjà',
    
    // Subjects
    subjectNotFound: 'Matière non trouvée',
    subjectNameTaken: 'Une matière avec ce nom existe déjà',
  },

  success: {
    // Users
    userCreated: 'Utilisateur créé avec succès',
    userUpdated: 'Utilisateur modifié avec succès',
    userDeleted: 'Utilisateur supprimé avec succès',
    
    // Classes
    classCreated: 'Classe créée avec succès',
    classUpdated: 'Classe modifiée avec succès',
    classDeleted: 'Classe supprimée avec succès',
    
    // Subjects
    subjectCreated: 'Matière créée avec succès',
    subjectUpdated: 'Matière modifiée avec succès',
    subjectDeleted: 'Matière supprimée avec succès',
  },

  labels: {
    roles: {
      ADMIN: 'Administrateur',
      TEACHER: 'Professeur',
      STUDENT: 'Élève',
    },
    levels: {
      '6eme': '6ème',
      '5eme': '5ème',
      '4eme': '4ème',
      '3eme': '3ème',
      '2nde': '2nde',
      '1ere': '1ère',
      terminale: 'Terminale',
    },
  },
} as const;
