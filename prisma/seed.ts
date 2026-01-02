// prisma/seed.ts
// BlaizBot V1 - Script de seed initial

import { PrismaClient, Role } from '@prisma/client'
import { hash } from 'bcryptjs'
import crypto from 'crypto'

const prisma = new PrismaClient()

// -----------------------------------------------------
// DONNÉES DE SEED
// -----------------------------------------------------

const SUBJECTS = [
  { id: 'subject-mathematiques', name: 'Mathématiques' },
  { id: 'subject-francais', name: 'Français' },
  { id: 'subject-histoire-geographie', name: 'Histoire-Géographie' },
  { id: 'subject-svt', name: 'SVT' },
  { id: 'subject-physique-chimie', name: 'Physique-Chimie' },
  { id: 'subject-anglais', name: 'Anglais' },
]

const CLASS_COLORS: Record<string, string> = {
  '6ème A': '#3b82f6',  // Bleu
  '6ème B': '#8b5cf6',  // Violet
  '5ème A': '#ec4899',  // Rose
  '5ème B': '#f59e0b',  // Orange
  '4ème A': '#10b981',  // Vert
  '4ème B': '#06b6d4',  // Cyan
  '3ème A': '#ef4444',  // Rouge
  '3ème B': '#6366f1',  // Indigo
}

const CLASSES = [
  { id: 'class-3eme-a', name: '3ème A', level: '3ème', color: CLASS_COLORS['3ème A'], updatedAt: new Date() },
  { id: 'class-3eme-b', name: '3ème B', level: '3ème', color: CLASS_COLORS['3ème B'], updatedAt: new Date() },
  { id: 'class-4eme-a', name: '4ème A', level: '4ème', color: CLASS_COLORS['4ème A'], updatedAt: new Date() },
]

const USERS = {
  admin: {
    id: 'user-admin-system',
    email: 'admin@blaizbot.edu',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'SYSTÈME',
    role: Role.ADMIN,
  },
  teachers: [
    {
      id: 'user-teacher-dupont',
      email: 'm.dupont@blaizbot.edu',
      password: 'prof123',
      firstName: 'Marc',
      lastName: 'DUPONT',
      role: Role.TEACHER,
    },
    {
      id: 'user-teacher-bernard',
      email: 's.bernard@blaizbot.edu',
      password: 'prof123',
      firstName: 'Sophie',
      lastName: 'BERNARD',
      role: Role.TEACHER,
    },
  ],
  students: [
    {
      id: 'user-student-martin',
      email: 'lucas.martin@blaizbot.edu',
      password: 'eleve123',
      firstName: 'Lucas',
      lastName: 'MARTIN',
      className: '3ème A',
      phone: '06 12 34 56 78',
      address: '12 rue des Lilas',
      city: 'Paris',
      postalCode: '75015',
      parentEmail: 'parents.martin@email.com',
    },
    {
      id: 'user-student-durand',
      email: 'emma.durand@blaizbot.edu',
      password: 'eleve123',
      firstName: 'Emma',
      lastName: 'DURAND',
      className: '3ème A',
      phone: '06 23 45 67 89',
      address: '45 avenue Victor Hugo',
      city: 'Lyon',
      postalCode: '69003',
      parentEmail: 'famille.durand@email.com',
    },
    {
      id: 'user-student-petit',
      email: 'noah.petit@blaizbot.edu',
      password: 'eleve123',
      firstName: 'Noah',
      lastName: 'PETIT',
      className: '3ème B',
      phone: '06 34 56 78 90',
      address: '8 place de la République',
      city: 'Marseille',
      postalCode: '13001',
      parentEmail: 'petit.famille@email.com',
    },
    {
      id: 'user-student-moreau',
      email: 'lea.moreau@blaizbot.edu',
      password: 'eleve123',
      firstName: 'Léa',
      lastName: 'MOREAU',
      className: '3ème B',
      phone: '06 45 67 89 01',
      address: '23 boulevard Pasteur',
      city: 'Toulouse',
      postalCode: '31000',
      parentEmail: 'moreau.parents@email.com',
    },
    {
      id: 'user-student-robert',
      email: 'hugo.robert@blaizbot.edu',
      password: 'eleve123',
      firstName: 'Hugo',
      lastName: 'ROBERT',
      className: '4ème A',
      phone: '06 56 78 90 12',
      address: '67 rue de la Paix',
      city: 'Bordeaux',
      postalCode: '33000',
      parentEmail: 'robert.famille@email.com',
    },
  ],
}

// -----------------------------------------------------
// FONCTIONS DE SEED
// -----------------------------------------------------

async function seedSubjects() {
  console.log('📚 Création des matières...')

  for (const subject of SUBJECTS) {
    await prisma.subject.upsert({
      where: { name: subject.name },
      update: {},
      create: { ...subject, updatedAt: new Date() },
    })
  }

  console.log(`✅ ${SUBJECTS.length} matières créées`)
}

async function seedClasses() {
  console.log('🏫 Création des classes...')

  for (const cls of CLASSES) {
    await prisma.class.upsert({
      where: { name: cls.name },
      update: {},
      create: cls,
    })
  }

  console.log(`✅ ${CLASSES.length} classes créées`)
}

async function seedUsers() {
  console.log('👥 Création des utilisateurs...')

  // Admin
  const adminPassword = await hash(USERS.admin.password, 12)
  await prisma.user.upsert({
    where: { email: USERS.admin.email },
    update: {},
    create: {
      id: USERS.admin.id,
      email: USERS.admin.email,
      passwordHash: adminPassword,
      firstName: USERS.admin.firstName,
      lastName: USERS.admin.lastName,
      role: USERS.admin.role,
      updatedAt: new Date(),
    },
  })

  // Teachers avec profil
  for (const teacher of USERS.teachers) {
    const hashedPassword = await hash(teacher.password, 12)
    await prisma.user.upsert({
      where: { email: teacher.email },
      update: {},
      create: {
        id: teacher.id,
        email: teacher.email,
        passwordHash: hashedPassword,
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        role: teacher.role,
        updatedAt: new Date(),
        TeacherProfile: {
          create: {
            id: `teacher-profile-${teacher.id}`,
          },
        },
      },
    })
  }

  // Students avec profil
  for (const student of USERS.students) {
    const hashedPassword = await hash(student.password, 12)
    const cls = await prisma.class.findUnique({
      where: { name: student.className },
    })

    if (!cls) {
      console.warn(`⚠️ Classe ${student.className} non trouvée`)
      continue
    }

    await prisma.user.upsert({
      where: { email: student.email },
      update: {
        phone: student.phone,
        address: student.address,
        city: student.city,
        postalCode: student.postalCode,
      },
      create: {
        id: student.id,
        email: student.email,
        passwordHash: hashedPassword,
        firstName: student.firstName,
        lastName: student.lastName,
        role: Role.STUDENT,
        phone: student.phone,
        address: student.address,
        city: student.city,
        postalCode: student.postalCode,
        updatedAt: new Date(),
        StudentProfile: {
          create: {
            id: `student-profile-${student.id}`,
            classId: cls.id,
            parentEmail: student.parentEmail,
          },
        },
      },
    })
  }

  const total = 1 + USERS.teachers.length + USERS.students.length
  console.log(`✅ ${total} utilisateurs créés`)
}

async function seedTeacherAssignments() {
  console.log('🔗 Affectation des profs aux classes...')

  // M. Dupont (Maths/SVT) → 3ème A, 3ème B
  const marcTeacher = await prisma.user.findUnique({
    where: { email: 'm.dupont@blaizbot.edu' },
    include: { TeacherProfile: true },
  })

  // Mme Bernard (Histoire/Français) → 3ème A, 4ème A
  const sophieTeacher = await prisma.user.findUnique({
    where: { email: 's.bernard@blaizbot.edu' },
    include: { TeacherProfile: true },
  })

  const class3A = await prisma.class.findUnique({ where: { name: '3ème A' } })
  const class3B = await prisma.class.findUnique({ where: { name: '3ème B' } })
  const class4A = await prisma.class.findUnique({ where: { name: '4ème A' } })

  const mathSubject = await prisma.subject.findUnique({ where: { name: 'Mathématiques' } })
  const histSubject = await prisma.subject.findUnique({ where: { name: 'Histoire-Géographie' } })

  if (!marcTeacher?.TeacherProfile || !sophieTeacher?.TeacherProfile || 
      !class3A || !class3B || !class4A || !mathSubject || !histSubject) {
    console.warn('⚠️ Données manquantes pour les affectations')
    return
  }

  // Affecter M. Dupont aux classes 3ème A, 3ème B et 4ème A + matières
  await prisma.teacherProfile.update({
    where: { id: marcTeacher.TeacherProfile.id },
    data: {
      Class: {
        connect: [{ id: class3A.id }, { id: class3B.id }, { id: class4A.id }],
      },
      Subject: {
        connect: [
          { name: 'Mathématiques' },
          { name: 'SVT' },
        ],
      },
    },
  })

  // Affecter Mme Bernard aux classes 3ème A et 4ème A + matières
  await prisma.teacherProfile.update({
    where: { id: sophieTeacher.TeacherProfile.id },
    data: {
      Class: {
        connect: [{ id: class3A.id }, { id: class4A.id }],
      },
      Subject: {
        connect: [
          { name: 'Histoire-Géographie' },
          { name: 'Français' },
        ],
      },
    },
  })

  console.log('✅ Profs affectés aux classes et matières')
}

async function seedCourses() {
  console.log('📖 Création des cours...')

  const mathSubject = await prisma.subject.findUnique({ where: { name: 'Mathématiques' } })
  const histSubject = await prisma.subject.findUnique({ where: { name: 'Histoire-Géographie' } })
  const frSubject = await prisma.subject.findUnique({ where: { name: 'Français' } })
  const svtSubject = await prisma.subject.findUnique({ where: { name: 'SVT' } })

  const marcTeacher = await prisma.user.findUnique({
    where: { email: 'm.dupont@blaizbot.edu' },
    include: { TeacherProfile: true },
  })
  const sophieTeacher = await prisma.user.findUnique({
    where: { email: 's.bernard@blaizbot.edu' },
    include: { TeacherProfile: true },
  })

  if (!mathSubject || !histSubject || !frSubject || !svtSubject || 
      !marcTeacher?.TeacherProfile || !sophieTeacher?.TeacherProfile) {
    console.warn('⚠️ Données manquantes pour créer les cours')
    return
  }

  // Cours de M. Dupont (Maths + SVT)
  await prisma.course.upsert({
    where: { id: 'course-maths-fractions' },
    update: { isDraft: false, tags: ['Algèbre', 'Calcul', 'Niveau 3ème'] },
    create: {
      id: 'course-maths-fractions',
      title: 'Les Fractions',
      description: 'Maîtriser les opérations sur les fractions',
      subjectId: mathSubject.id,
      teacherId: marcTeacher.TeacherProfile.id,
      isDraft: false,
      tags: ['Algèbre', 'Calcul', 'Niveau 3ème'],
      updatedAt: new Date(),
    },
  })

  await prisma.course.upsert({
    where: { id: 'course-maths-equations' },
    update: { isDraft: false, tags: ['Algèbre', 'Équations', 'Niveau 3ème'] },
    create: {
      id: 'course-maths-equations',
      title: 'Équations du premier degré',
      description: 'Résoudre des équations simples',
      subjectId: mathSubject.id,
      teacherId: marcTeacher.TeacherProfile.id,
      isDraft: false,
      tags: ['Algèbre', 'Équations', 'Niveau 3ème'],
      updatedAt: new Date(),
    },
  })

  await prisma.course.upsert({
    where: { id: 'course-svt-photosynthese' },
    update: { isDraft: false, tags: ['Biologie', 'Végétaux', 'Niveau 3ème'] },
    create: {
      id: 'course-svt-photosynthese',
      title: 'La Photosynthèse',
      description: 'Comment les plantes produisent leur énergie',
      subjectId: svtSubject.id,
      teacherId: marcTeacher.TeacherProfile.id,
      isDraft: false,
      tags: ['Biologie', 'Végétaux', 'Niveau 3ème'],
      updatedAt: new Date(),
    },
  })

  // Cours de Mme Bernard (Histoire + Français)
  await prisma.course.upsert({
    where: { id: 'course-hist-revolution' },
    update: { isDraft: false, tags: ['XVIIIe siècle', 'France', 'Révolution'] },
    create: {
      id: 'course-hist-revolution',
      title: 'La Révolution Française',
      description: 'De 1789 à 1799 : causes, événements et conséquences',
      subjectId: histSubject.id,
      teacherId: sophieTeacher.TeacherProfile.id,
      isDraft: false,
      tags: ['XVIIIe siècle', 'France', 'Révolution'],
      updatedAt: new Date(),
    },
  })

  await prisma.course.upsert({
    where: { id: 'course-hist-napoleon' },
    update: { isDraft: false, tags: ['XIXe siècle', 'France', 'Empire'] },
    create: {
      id: 'course-hist-napoleon',
      title: 'L\'Empire Napoléonien',
      description: 'De 1804 à 1815',
      subjectId: histSubject.id,
      teacherId: sophieTeacher.TeacherProfile.id,
      isDraft: false,
      tags: ['XIXe siècle', 'France', 'Empire'],
      updatedAt: new Date(),
    },
  })

  await prisma.course.upsert({
    where: { id: 'course-fr-argumentation' },
    update: { isDraft: false, tags: ['Rédaction', 'Rhétorique', 'Expression'] },
    create: {
      id: 'course-fr-argumentation',
      title: 'L\'argumentation',
      description: 'Convaincre et persuader',
      subjectId: frSubject.id,
      teacherId: sophieTeacher.TeacherProfile.id,
      isDraft: false,
      tags: ['Rédaction', 'Rhétorique', 'Expression'],
      updatedAt: new Date(),
    },
  })

  console.log('✅ 6 cours créés')
}

// -----------------------------------------------------
// CHAPITRES ET SECTIONS DE DÉMONSTRATION
// -----------------------------------------------------

async function seedChaptersAndSections() {
  console.log('📚 Création des chapitres et sections...')

  // Chapitres pour le cours Photosynthèse
  const photoChapters = [
    {
      id: 'chapter-photo-1',
      courseId: 'course-svt-photosynthese',
      title: 'Introduction à la photosynthèse',
      description: 'Comprendre le processus fondamental de la photosynthèse',
      order: 1,
      sections: [
        {
          id: 'section-photo-1-1',
          title: 'Qu\'est-ce que la photosynthèse ?',
          type: 'LESSON',
          order: 1,
          content: '# La Photosynthèse\n\nLa **photosynthèse** est le processus par lequel les plantes vertes et certains autres organismes transforment l\'énergie lumineuse en énergie chimique.\n\n## L\'équation de base\n\n$$6CO_2 + 6H_2O + lumière \\rightarrow C_6H_{12}O_6 + 6O_2$$\n\n## Les acteurs principaux\n\n- **Chlorophylle** : pigment vert captant la lumière\n- **Chloroplastes** : organites où se déroule la réaction\n- **Stomates** : pores permettant les échanges gazeux',
        },
        {
          id: 'section-photo-1-2',
          title: 'Quiz : Les bases',
          type: 'EXERCISE',
          order: 2,
          content: '## Quiz - Les bases de la photosynthèse\n\n1. Quel gaz est absorbé par les plantes ?\n   - [ ] Oxygène\n   - [x] Dioxyde de carbone\n   - [ ] Azote\n\n2. Quel pigment donne leur couleur verte aux plantes ?\n   - [x] Chlorophylle\n   - [ ] Carotène\n   - [ ] Mélanine',
        },
      ],
    },
    {
      id: 'chapter-photo-2',
      courseId: 'course-svt-photosynthese',
      title: 'La phase lumineuse',
      description: 'Étude de la première étape de la photosynthèse',
      order: 2,
      sections: [
        {
          id: 'section-photo-2-1',
          title: 'Capture de l\'énergie solaire',
          type: 'LESSON',
          order: 1,
          content: '# La Phase Lumineuse\n\nCette phase se déroule dans les **thylakoïdes** des chloroplastes.\n\n## Étapes principales\n\n1. Absorption de la lumière par la chlorophylle\n2. Photolyse de l\'eau : $2H_2O \\rightarrow O_2 + 4H^+ + 4e^-$\n3. Production d\'ATP et NADPH\n\n## Importance\n\nC\'est durant cette phase que l\'oxygène est libéré dans l\'atmosphère !',
        },
        {
          id: 'section-photo-2-2',
          title: 'Exercice : Schéma à compléter',
          type: 'EXERCISE',
          order: 2,
          content: '## Exercice - Complétez le schéma\n\nIdentifiez les éléments suivants dans le schéma de la phase lumineuse :\n\n- Les photosystèmes I et II\n- La chaîne de transport d\'électrons\n- L\'ATP synthase\n- Le site de production de l\'oxygène',
        },
      ],
    },
    {
      id: 'chapter-photo-3',
      courseId: 'course-svt-photosynthese',
      title: 'Le cycle de Calvin',
      description: 'La fixation du carbone',
      order: 3,
      sections: [
        {
          id: 'section-photo-3-1',
          title: 'La phase sombre',
          type: 'LESSON',
          order: 1,
          content: '# Le Cycle de Calvin\n\nAussi appelé "phase sombre", ce cycle se déroule dans le **stroma** des chloroplastes.\n\n## Les 3 étapes\n\n1. **Fixation** : Le CO₂ se lie au RuBP (enzyme RuBisCO)\n2. **Réduction** : Formation de G3P grâce à l\'ATP et NADPH\n3. **Régénération** : Le RuBP est reconstitué\n\n## Bilan\n\nPour produire une molécule de glucose, le cycle doit tourner **6 fois** !',
        },
      ],
    },
  ]

  // Chapitres pour le cours Fractions
  const fractionsChapters = [
    {
      id: 'chapter-frac-1',
      courseId: 'course-maths-fractions',
      title: 'Les bases des fractions',
      description: 'Comprendre ce qu\'est une fraction',
      order: 1,
      sections: [
        {
          id: 'section-frac-1-1',
          title: 'Définition d\'une fraction',
          type: 'LESSON',
          order: 1,
          content: '# Les Fractions\n\nUne **fraction** représente une partie d\'un tout.\n\n## Notation\n\n$$\\frac{a}{b}$$\n\n- **a** = numérateur (ce qu\'on prend)\n- **b** = dénominateur (en combien de parts on divise)\n\n## Exemples\n\n- $\\frac{1}{2}$ = une moitié\n- $\\frac{3}{4}$ = trois quarts\n- $\\frac{2}{5}$ = deux cinquièmes',
        },
        {
          id: 'section-frac-1-2',
          title: 'Quiz : Lecture de fractions',
          type: 'EXERCISE',
          order: 2,
          content: '## Quiz - Lecture de fractions\n\n1. Comment lit-on $\\frac{5}{8}$ ?\n   - [x] Cinq huitièmes\n   - [ ] Huit cinquièmes\n   - [ ] Cinq sur huit\n\n2. Dans $\\frac{3}{7}$, quel est le dénominateur ?\n   - [ ] 3\n   - [x] 7',
        },
      ],
    },
    {
      id: 'chapter-frac-2',
      courseId: 'course-maths-fractions',
      title: 'Addition et soustraction',
      description: 'Opérations sur les fractions',
      order: 2,
      sections: [
        {
          id: 'section-frac-2-1',
          title: 'Même dénominateur',
          type: 'LESSON',
          order: 1,
          content: '# Addition de fractions\n\n## Règle de base\n\nQuand les dénominateurs sont identiques :\n\n$$\\frac{a}{c} + \\frac{b}{c} = \\frac{a+b}{c}$$\n\n## Exemple\n\n$$\\frac{2}{5} + \\frac{1}{5} = \\frac{3}{5}$$',
        },
        {
          id: 'section-frac-2-2',
          title: 'Exercices pratiques',
          type: 'EXERCISE',
          order: 2,
          content: '## Exercices\n\nCalculez :\n\n1. $\\frac{1}{4} + \\frac{2}{4} = ?$\n2. $\\frac{5}{8} - \\frac{3}{8} = ?$\n3. $\\frac{2}{6} + \\frac{3}{6} = ?$',
        },
      ],
    },
  ]

  // Créer les chapitres et sections pour Photosynthèse
  for (const chapter of photoChapters) {
    await prisma.chapter.upsert({
      where: { id: chapter.id },
      update: {},
      create: {
        id: chapter.id,
        courseId: chapter.courseId,
        title: chapter.title,
        description: chapter.description,
        order: chapter.order,
        updatedAt: new Date(),
      },
    })
    
    for (const section of chapter.sections) {
      await prisma.section.upsert({
        where: { id: section.id },
        update: {},
        create: {
          id: section.id,
          chapterId: chapter.id,
          title: section.title,
          type: section.type,
          order: section.order,
          content: section.content,
          updatedAt: new Date(),
        },
      })
    }
  }

  // Créer les chapitres et sections pour Fractions
  for (const chapter of fractionsChapters) {
    await prisma.chapter.upsert({
      where: { id: chapter.id },
      update: {},
      create: {
        id: chapter.id,
        courseId: chapter.courseId,
        title: chapter.title,
        description: chapter.description,
        order: chapter.order,
        updatedAt: new Date(),
      },
    })
    
    for (const section of chapter.sections) {
      await prisma.section.upsert({
        where: { id: section.id },
        update: {},
        create: {
          id: section.id,
          chapterId: chapter.id,
          title: section.title,
          type: section.type,
          order: section.order,
          content: section.content,
          updatedAt: new Date(),
        },
      })
    }
  }

  console.log('✅ Chapitres et sections créés pour Photosynthèse et Fractions')
}

async function seedAssignments() {
  console.log('📝 Création des assignations...')

  const marcTeacher = await prisma.teacherProfile.findFirst({
    where: { User: { email: 'm.dupont@blaizbot.edu' } },
  })
  const class3A = await prisma.class.findUnique({ where: { name: '3ème A' } })
  const mathCourse = await prisma.course.findUnique({ where: { id: 'course-maths-fractions' } })

  if (marcTeacher && class3A && mathCourse) {
    // Vérifier si l'assignation existe déjà
    const existing = await prisma.courseAssignment.findFirst({
      where: {
        courseId: mathCourse.id,
        classId: class3A.id,
      }
    })

    if (!existing) {
      const now = new Date()
      const assignment = await prisma.courseAssignment.create({
        data: {
          teacherId: marcTeacher.id,
          courseId: mathCourse.id,
          classId: class3A.id,
          targetType: 'CLASS',
          title: 'Cours sur les Fractions',
          instructions: 'Veuillez étudier ce cours pour la semaine prochaine.',
          startDate: now,
          dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // +7 jours
          updatedAt: now,
        }
      })
      
      // Créer StudentProgress pour tous les élèves de la classe
      const classStudents = await prisma.studentProfile.findMany({
        where: { classId: class3A.id },
        select: { userId: true },
      })

      await prisma.studentProgress.createMany({
        data: classStudents.map((s) => ({
          id: crypto.randomUUID(),
          assignmentId: assignment.id,
          studentId: s.userId,
          status: 'IN_PROGRESS',
          updatedAt: new Date(),
        })),
        skipDuplicates: true,
      })
      
      console.log(`✅ Assignation créée : Fractions -> 3ème A (${classStudents.length} élèves)`)
    } else {
      console.log('ℹ️ Assignation déjà existante')
    }
  }
}

// -----------------------------------------------------
// STUDENT SCORES (Données de test pour filtres/tri)
// -----------------------------------------------------

interface ScoreData {
  studentEmail: string
  courseId: string
  quizAvg: number
  exerciseAvg: number
  aiComprehension: number
  quizCount: number
  exerciseCount: number
  aiSessionCount: number
  examGrade: number | null
  examDate: Date | null
}

// Formule : continuousScore = quiz*35% + exos*40% + ia*25%
function calcContinuous(quiz: number, exos: number, ia: number): number {
  return quiz * 0.35 + exos * 0.40 + ia * 0.25
}

// Formule : finalScore = continuous*40% + (examGrade/6)*100*60%
function calcFinal(continuous: number, examGrade: number | null): number | null {
  if (examGrade === null) return null
  return continuous * 0.4 + (examGrade / 6) * 100 * 0.6
}

// Formule : finalGrade = finalScore / 100 * 6
function calcGrade(finalScore: number | null): number | null {
  if (finalScore === null) return null
  return (finalScore / 100) * 6
}

const STUDENT_SCORES: ScoreData[] = [
  // Lucas MARTIN (3ème A) - 3 cours : 🟢 Fractions, 🟡 Équations, 🔴 Photosynthèse
  {
    studentEmail: 'lucas.martin@blaizbot.edu',
    courseId: 'course-maths-fractions',
    quizAvg: 85, exerciseAvg: 78, aiComprehension: 70,
    quizCount: 5, exerciseCount: 8, aiSessionCount: 3,
    examGrade: 5.2, examDate: new Date('2025-12-15'),
  },
  {
    studentEmail: 'lucas.martin@blaizbot.edu',
    courseId: 'course-maths-equations',
    quizAvg: 60, exerciseAvg: 55, aiComprehension: 45,
    quizCount: 4, exerciseCount: 6, aiSessionCount: 2,
    examGrade: 4.0, examDate: new Date('2025-12-18'),
  },
  {
    studentEmail: 'lucas.martin@blaizbot.edu',
    courseId: 'course-svt-photosynthese',
    quizAvg: 40, exerciseAvg: 35, aiComprehension: 30,
    quizCount: 2, exerciseCount: 3, aiSessionCount: 1,
    examGrade: null, examDate: null, // Pas encore d'examen
  },
  
  // Emma DURAND (3ème A) - 2 cours : 🟢 Fractions, 🟡 Équations (sans examen)
  {
    studentEmail: 'emma.durand@blaizbot.edu',
    courseId: 'course-maths-fractions',
    quizAvg: 90, exerciseAvg: 88, aiComprehension: 85,
    quizCount: 6, exerciseCount: 10, aiSessionCount: 4,
    examGrade: 5.5, examDate: new Date('2025-12-15'),
  },
  {
    studentEmail: 'emma.durand@blaizbot.edu',
    courseId: 'course-maths-equations',
    quizAvg: 70, exerciseAvg: 65, aiComprehension: 60,
    quizCount: 4, exerciseCount: 7, aiSessionCount: 2,
    examGrade: null, examDate: null,
  },
  
  // Noah PETIT (3ème B) - 2 cours : 🔴 Fractions, 🟢 Photosynthèse
  {
    studentEmail: 'noah.petit@blaizbot.edu',
    courseId: 'course-maths-fractions',
    quizAvg: 50, exerciseAvg: 45, aiComprehension: 40,
    quizCount: 3, exerciseCount: 4, aiSessionCount: 1,
    examGrade: 3.2, examDate: new Date('2025-12-15'),
  },
  {
    studentEmail: 'noah.petit@blaizbot.edu',
    courseId: 'course-svt-photosynthese',
    quizAvg: 75, exerciseAvg: 70, aiComprehension: 68,
    quizCount: 4, exerciseCount: 5, aiSessionCount: 2,
    examGrade: 4.8, examDate: new Date('2025-12-20'),
  },
  
  // Léa MOREAU (3ème B) - 1 cours : 🟢 Fractions
  {
    studentEmail: 'lea.moreau@blaizbot.edu',
    courseId: 'course-maths-fractions',
    quizAvg: 80, exerciseAvg: 82, aiComprehension: 75,
    quizCount: 5, exerciseCount: 7, aiSessionCount: 3,
    examGrade: 5.0, examDate: new Date('2025-12-15'),
  },
  
  // Hugo ROBERT (4ème A) - 1 cours : 🟡 Fractions
  {
    studentEmail: 'hugo.robert@blaizbot.edu',
    courseId: 'course-maths-fractions',
    quizAvg: 55, exerciseAvg: 50, aiComprehension: 48,
    quizCount: 3, exerciseCount: 5, aiSessionCount: 2,
    examGrade: 3.5, examDate: new Date('2025-12-15'),
  },
]

async function seedStudentScores() {
  console.log('📊 Création des scores élèves...')

  let created = 0
  let skipped = 0

  for (const scoreData of STUDENT_SCORES) {
    const student = await prisma.user.findUnique({
      where: { email: scoreData.studentEmail },
    })

    if (!student) {
      console.warn(`⚠️ Élève ${scoreData.studentEmail} non trouvé`)
      skipped++
      continue
    }

    const course = await prisma.course.findUnique({
      where: { id: scoreData.courseId },
    })

    if (!course) {
      console.warn(`⚠️ Cours ${scoreData.courseId} non trouvé`)
      skipped++
      continue
    }

    const continuousScore = calcContinuous(
      scoreData.quizAvg,
      scoreData.exerciseAvg,
      scoreData.aiComprehension
    )
    const finalScore = calcFinal(continuousScore, scoreData.examGrade)
    const finalGrade = calcGrade(finalScore)

    const scoreId = `score-${student.id}-${course.id}`
    await prisma.studentScore.upsert({
      where: {
        studentId_courseId: {
          studentId: student.id,
          courseId: course.id,
        },
      },
      update: {
        quizAvg: scoreData.quizAvg,
        exerciseAvg: scoreData.exerciseAvg,
        aiComprehension: scoreData.aiComprehension,
        continuousScore,
        quizCount: scoreData.quizCount,
        exerciseCount: scoreData.exerciseCount,
        aiSessionCount: scoreData.aiSessionCount,
        examGrade: scoreData.examGrade,
        examDate: scoreData.examDate,
        finalScore,
        finalGrade,
        updatedAt: new Date(),
      },
      create: {
        id: scoreId,
        studentId: student.id,
        courseId: course.id,
        quizAvg: scoreData.quizAvg,
        exerciseAvg: scoreData.exerciseAvg,
        aiComprehension: scoreData.aiComprehension,
        continuousScore,
        quizCount: scoreData.quizCount,
        exerciseCount: scoreData.exerciseCount,
        aiSessionCount: scoreData.aiSessionCount,
        examGrade: scoreData.examGrade,
        examDate: scoreData.examDate,
        finalScore,
        finalGrade,
        updatedAt: new Date(),
      },
    })

    created++
  }

  console.log(`✅ ${created} scores créés, ${skipped} ignorés`)
}

// -----------------------------------------------------
// MAIN
// -----------------------------------------------------

async function main() {
  console.log('🌱 Démarrage du seed BlaizBot...\n')

  await seedSubjects()
  await seedClasses()
  await seedUsers()
  await seedTeacherAssignments()
  await seedCourses()
  await seedChaptersAndSections()  // ← Ajout des chapitres et sections
  await seedAssignments()
  await seedStudentScores()

  // ✅ Fix StudentProgress manquants
  console.log('\n🔧 Création des StudentProgress manquants...')
  const assignmentsToFix = await prisma.courseAssignment.findMany({
    where: { classId: { not: null } },
    include: {
      StudentProgress: true,
      Class: { include: { StudentProfile: { select: { userId: true } } } },
    },
  })

  let fixedCount = 0
  for (const assignment of assignmentsToFix) {
    if (!assignment.Class) continue
    const studentIds = assignment.Class.StudentProfile.map((s) => s.userId)
    const existingIds = assignment.StudentProgress.map((p) => p.studentId)
    const missing = studentIds.filter((id) => !existingIds.includes(id))
    if (missing.length > 0) {
      await prisma.studentProgress.createMany({
        data: missing.map((studentId) => ({
          id: crypto.randomUUID(),
          assignmentId: assignment.id,
          studentId,
          sectionId: assignment.sectionId,
          status: 'NOT_STARTED',
          updatedAt: new Date(),
        })),
        skipDuplicates: true,
      })
      fixedCount += missing.length
    }
  }
  console.log(`   ${fixedCount} StudentProgress créés`)

  // ✅ Créer assignations pour cours avec scores mais sans assignation
  console.log('\n🔧 Création assignations pour cours avec scores...')
  const scoresWithoutAssignments = await prisma.studentScore.findMany({
    include: {
      User: { include: { StudentProfile: { select: { classId: true } } } },
      Course: { include: { Subject: true } },
    },
  })

  let assignCreated = 0
  for (const score of scoresWithoutAssignments) {
    if (!score.User?.StudentProfile?.classId || !score.courseId) continue

    // Vérifier si une assignation existe déjà pour ce cours + classe
    const existingAssignment = await prisma.courseAssignment.findFirst({
      where: {
        courseId: score.courseId,
        classId: score.User.StudentProfile.classId,
      },
    })

    if (!existingAssignment) {
      // Récupérer le prof de la matière
      const teacher = await prisma.teacherProfile.findFirst({
        where: {
          User: { role: 'TEACHER' },
          Subject: { some: { id: score.Course.subjectId } },
        },
      })

      if (teacher) {
        const assignmentId = `assignment-${score.courseId}-${score.User.StudentProfile.classId}`
        const now = new Date()
        const newAssignment = await prisma.courseAssignment.create({
          data: {
            id: assignmentId,
            teacherId: teacher.id,
            courseId: score.courseId,
            title: `${score.Course.title} - Travail de classe`,
            targetType: 'CLASS',
            classId: score.User.StudentProfile.classId,
            startDate: now,
            dueDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // +30 jours
            priority: 'MEDIUM',
            isRecurring: false,
            updatedAt: now,
          },
        })

        // Créer StudentProgress pour tous les élèves de la classe
        const classStudents = await prisma.studentProfile.findMany({
          where: { classId: score.User.StudentProfile.classId },
          select: { userId: true },
        })

        await prisma.studentProgress.createMany({
          data: classStudents.map((s) => ({
            id: crypto.randomUUID(),
            assignmentId: newAssignment.id,
            studentId: s.userId,
            status: 'IN_PROGRESS', // Puisqu'ils ont déjà commencé
            updatedAt: new Date(),
          })),
          skipDuplicates: true,
        })

        assignCreated++
      }
    }
  }
  console.log(`   ${assignCreated} assignations créées pour cours avec scores`)

  console.log('\n✅ Seed terminé avec succès !')
  console.log('\n📋 Comptes de test :')
  console.log('   Admin : admin@blaizbot.edu / admin123')
  console.log('   Prof  : m.dupont@blaizbot.edu / prof123')
  console.log('   Élève : lucas.martin@blaizbot.edu / eleve123')
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
