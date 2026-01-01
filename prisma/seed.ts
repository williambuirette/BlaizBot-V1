// prisma/seed.ts
// BlaizBot V1 - Script de seed initial

import { PrismaClient, Role } from '@prisma/client'
import { hash } from 'bcryptjs'

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

const CLASSES = [
  { id: 'class-3eme-a', name: '3ème A', level: '3ème', updatedAt: new Date() },
  { id: 'class-3eme-b', name: '3ème B', level: '3ème', updatedAt: new Date() },
  { id: 'class-4eme-a', name: '4ème A', level: '4ème', updatedAt: new Date() },
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

  // Affecter M. Dupont aux classes 3ème A et 3ème B + matières
  await prisma.teacherProfile.update({
    where: { id: marcTeacher.TeacherProfile.id },
    data: {
      Class: {
        connect: [{ id: class3A.id }, { id: class3B.id }],
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
    update: {},
    create: {
      id: 'course-maths-fractions',
      title: 'Les Fractions',
      description: 'Maîtriser les opérations sur les fractions',
      subjectId: mathSubject.id,
      teacherId: marcTeacher.TeacherProfile.id,
      updatedAt: new Date(),
    },
  })

  await prisma.course.upsert({
    where: { id: 'course-maths-equations' },
    update: {},
    create: {
      id: 'course-maths-equations',
      title: 'Équations du premier degré',
      description: 'Résoudre des équations simples',
      subjectId: mathSubject.id,
      teacherId: marcTeacher.TeacherProfile.id,
      updatedAt: new Date(),
    },
  })

  await prisma.course.upsert({
    where: { id: 'course-svt-photosynthese' },
    update: {},
    create: {
      id: 'course-svt-photosynthese',
      title: 'La Photosynthèse',
      description: 'Comment les plantes produisent leur énergie',
      subjectId: svtSubject.id,
      teacherId: marcTeacher.TeacherProfile.id,
      updatedAt: new Date(),
    },
  })

  // Cours de Mme Bernard (Histoire + Français)
  await prisma.course.upsert({
    where: { id: 'course-hist-revolution' },
    update: {},
    create: {
      id: 'course-hist-revolution',
      title: 'La Révolution Française',
      description: 'De 1789 à 1799 : causes, événements et conséquences',
      subjectId: histSubject.id,
      teacherId: sophieTeacher.TeacherProfile.id,
      updatedAt: new Date(),
    },
  })

  await prisma.course.upsert({
    where: { id: 'course-hist-napoleon' },
    update: {},
    create: {
      id: 'course-hist-napoleon',
      title: 'L\'Empire Napoléonien',
      description: 'De 1804 à 1815',
      subjectId: histSubject.id,
      teacherId: sophieTeacher.TeacherProfile.id,
      updatedAt: new Date(),
    },
  })

  await prisma.course.upsert({
    where: { id: 'course-fr-argumentation' },
    update: {},
    create: {
      id: 'course-fr-argumentation',
      title: 'L\'argumentation',
      description: 'Convaincre et persuader',
      subjectId: frSubject.id,
      teacherId: sophieTeacher.TeacherProfile.id,
      updatedAt: new Date(),
    },
  })

  console.log('✅ 6 cours créés')
}

async function seedAssignments() {
  console.log('📝 Création des assignations...')

  const marcTeacher = await prisma.user.findUnique({ where: { email: 'm.dupont@blaizbot.edu' } })
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
      await prisma.courseAssignment.create({
        data: {
          teacherId: marcTeacher.id,
          courseId: mathCourse.id,
          classId: class3A.id,
          targetType: 'CLASS',
          title: 'Cours sur les Fractions',
          instructions: 'Veuillez étudier ce cours pour la semaine prochaine.',
        }
      })
      console.log('✅ Assignation créée : Fractions -> 3ème A')
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
  await seedAssignments()
  await seedStudentScores()

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
