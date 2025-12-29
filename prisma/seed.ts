// prisma/seed.ts
// BlaizBot V1 - Script de seed initial

import { PrismaClient, Role } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

// -----------------------------------------------------
// DONNÉES DE SEED
// -----------------------------------------------------

const SUBJECTS = [
  { name: 'Mathématiques' },
  { name: 'Français' },
  { name: 'Histoire-Géographie' },
  { name: 'SVT' },
  { name: 'Physique-Chimie' },
  { name: 'Anglais' },
]

const CLASSES = [
  { name: '3ème A', level: '3ème' },
  { name: '3ème B', level: '3ème' },
  { name: '4ème A', level: '4ème' },
]

const USERS = {
  admin: {
    email: 'admin@blaizbot.edu',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'SYSTÈME',
    role: Role.ADMIN,
  },
  teachers: [
    {
      email: 'm.dupont@blaizbot.edu',
      password: 'prof123',
      firstName: 'Marc',
      lastName: 'DUPONT',
      role: Role.TEACHER,
    },
    {
      email: 's.bernard@blaizbot.edu',
      password: 'prof123',
      firstName: 'Sophie',
      lastName: 'BERNARD',
      role: Role.TEACHER,
    },
  ],
  students: [
    {
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
      create: subject,
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
      email: USERS.admin.email,
      passwordHash: adminPassword,
      firstName: USERS.admin.firstName,
      lastName: USERS.admin.lastName,
      role: USERS.admin.role,
    },
  })

  // Teachers avec profil
  for (const teacher of USERS.teachers) {
    const hashedPassword = await hash(teacher.password, 12)
    await prisma.user.upsert({
      where: { email: teacher.email },
      update: {},
      create: {
        email: teacher.email,
        passwordHash: hashedPassword,
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        role: teacher.role,
        teacherProfile: {
          create: {},
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
        email: student.email,
        passwordHash: hashedPassword,
        firstName: student.firstName,
        lastName: student.lastName,
        role: Role.STUDENT,
        phone: student.phone,
        address: student.address,
        city: student.city,
        postalCode: student.postalCode,
        studentProfile: {
          create: {
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
    include: { teacherProfile: true },
  })

  // Mme Bernard (Histoire/Français) → 3ème A, 4ème A
  const sophieTeacher = await prisma.user.findUnique({
    where: { email: 's.bernard@blaizbot.edu' },
    include: { teacherProfile: true },
  })

  const class3A = await prisma.class.findUnique({ where: { name: '3ème A' } })
  const class3B = await prisma.class.findUnique({ where: { name: '3ème B' } })
  const class4A = await prisma.class.findUnique({ where: { name: '4ème A' } })

  const mathSubject = await prisma.subject.findUnique({ where: { name: 'Mathématiques' } })
  const histSubject = await prisma.subject.findUnique({ where: { name: 'Histoire-Géographie' } })

  if (!marcTeacher?.teacherProfile || !sophieTeacher?.teacherProfile || 
      !class3A || !class3B || !class4A || !mathSubject || !histSubject) {
    console.warn('⚠️ Données manquantes pour les affectations')
    return
  }

  // Affecter M. Dupont aux classes 3ème A et 3ème B + matières
  await prisma.teacherProfile.update({
    where: { id: marcTeacher.teacherProfile.id },
    data: {
      classes: {
        connect: [{ id: class3A.id }, { id: class3B.id }],
      },
      subjects: {
        connect: [
          { name: 'Mathématiques' },
          { name: 'SVT' },
        ],
      },
    },
  })

  // Affecter Mme Bernard aux classes 3ème A et 4ème A + matières
  await prisma.teacherProfile.update({
    where: { id: sophieTeacher.teacherProfile.id },
    data: {
      classes: {
        connect: [{ id: class3A.id }, { id: class4A.id }],
      },
      subjects: {
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
    include: { teacherProfile: true },
  })
  const sophieTeacher = await prisma.user.findUnique({
    where: { email: 's.bernard@blaizbot.edu' },
    include: { teacherProfile: true },
  })

  if (!mathSubject || !histSubject || !frSubject || !svtSubject || 
      !marcTeacher?.teacherProfile || !sophieTeacher?.teacherProfile) {
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
      teacherId: marcTeacher.teacherProfile.id,
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
      teacherId: marcTeacher.teacherProfile.id,
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
      teacherId: marcTeacher.teacherProfile.id,
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
      teacherId: sophieTeacher.teacherProfile.id,
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
      teacherId: sophieTeacher.teacherProfile.id,
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
      teacherId: sophieTeacher.teacherProfile.id,
    },
  })

  console.log('✅ 6 cours créés')
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
