// =====================================================
// BlaizBot V1 - Template Script Seed
// =====================================================
// Ce fichier sera complété en Phase 4 (Database)
// Commande : npm run seed (ou npx prisma db seed)
// =====================================================

import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

// -----------------------------------------------------
// DONNÉES DE SEED
// -----------------------------------------------------

const SEED_DATA = {
  // Utilisateurs avec mots de passe hashés
  users: {
    admin: {
      email: 'admin@blaizbot.edu',
      password: 'admin123', // Sera hashé
      firstName: 'Admin',
      lastName: 'SYSTÈME',
      role: 'ADMIN',
    },
    teachers: [
      {
        email: 'm.dupont@blaizbot.edu',
        password: 'prof123',
        firstName: 'Marc',
        lastName: 'DUPONT',
        role: 'TEACHER',
      },
      {
        email: 's.bernard@blaizbot.edu',
        password: 'prof123',
        firstName: 'Sophie',
        lastName: 'BERNARD',
        role: 'TEACHER',
      },
    ],
    students: [
      {
        email: 'lucas.martin@blaizbot.edu',
        password: 'eleve123',
        firstName: 'Lucas',
        lastName: 'MARTIN',
        role: 'STUDENT',
        className: '3ème A',
      },
      {
        email: 'emma.durand@blaizbot.edu',
        password: 'eleve123',
        firstName: 'Emma',
        lastName: 'DURAND',
        role: 'STUDENT',
        className: '3ème A',
      },
      {
        email: 'noah.petit@blaizbot.edu',
        password: 'eleve123',
        firstName: 'Noah',
        lastName: 'PETIT',
        role: 'STUDENT',
        className: '3ème B',
      },
      {
        email: 'lea.moreau@blaizbot.edu',
        password: 'eleve123',
        firstName: 'Léa',
        lastName: 'MOREAU',
        role: 'STUDENT',
        className: '3ème B',
      },
      {
        email: 'hugo.robert@blaizbot.edu',
        password: 'eleve123',
        firstName: 'Hugo',
        lastName: 'ROBERT',
        role: 'STUDENT',
        className: '4ème A',
      },
    ],
  },

  // Classes
  classes: [
    { name: '3ème A', level: '3ème' },
    { name: '3ème B', level: '3ème' },
    { name: '4ème A', level: '4ème' },
  ],

  // Matières avec couleurs
  subjects: [
    { name: 'Mathématiques', color: '#3B82F6' },
    { name: 'Français', color: '#EF4444' },
    { name: 'Histoire-Géographie', color: '#F59E0B' },
    { name: 'SVT', color: '#10B981' },
    { name: 'Physique-Chimie', color: '#8B5CF6' },
    { name: 'Anglais', color: '#EC4899' },
  ],

  // Cours avec contenu
  courses: [
    {
      title: 'Les Fractions',
      description: 'Maîtriser les opérations sur les fractions',
      subjectName: 'Mathématiques',
      teacherEmail: 'm.dupont@blaizbot.edu',
      chapters: [
        { title: 'Introduction aux fractions', order: 1 },
        { title: 'Addition de fractions', order: 2 },
        { title: 'Multiplication de fractions', order: 3 },
        { title: 'Division de fractions', order: 4 },
      ],
    },
    {
      title: 'La Révolution Française',
      description: 'De 1789 à 1799 : causes, événements et conséquences',
      subjectName: 'Histoire-Géographie',
      teacherEmail: 's.bernard@blaizbot.edu',
      chapters: [
        { title: 'Les causes de la Révolution', order: 1 },
        { title: '1789 : L\'année décisive', order: 2 },
        { title: 'La République', order: 3 },
        { title: 'La Terreur', order: 4 },
        { title: 'Le Directoire', order: 5 },
        { title: 'Bilan et héritage', order: 6 },
      ],
    },
    {
      title: 'La Photosynthèse',
      description: 'Comment les plantes produisent leur énergie',
      subjectName: 'SVT',
      teacherEmail: 'm.dupont@blaizbot.edu',
      chapters: [
        { title: 'Qu\'est-ce que la photosynthèse ?', order: 1 },
        { title: 'Les chloroplastes', order: 2 },
        { title: 'Équation et bilan', order: 3 },
      ],
    },
  ],
};

// -----------------------------------------------------
// FONCTIONS DE SEED
// -----------------------------------------------------

async function clearDatabase() {
  console.log('🗑️  Nettoyage de la base...');
  
  // Supprimer dans l'ordre inverse des dépendances
  // await prisma.message.deleteMany();
  // await prisma.chapter.deleteMany();
  // await prisma.course.deleteMany();
  // await prisma.enrollment.deleteMany();
  // await prisma.teacherAssignment.deleteMany();
  // await prisma.user.deleteMany();
  // await prisma.class.deleteMany();
  // await prisma.subject.deleteMany();
  
  console.log('✅ Base nettoyée');
}

async function seedSubjects() {
  console.log('📚 Création des matières...');
  
  for (const subject of SEED_DATA.subjects) {
    await prisma.subject.upsert({
      where: { name: subject.name },
      update: {},
      create: subject,
    });
  }
  
  console.log(`✅ ${SEED_DATA.subjects.length} matières créées`);
}

async function seedClasses() {
  console.log('🏫 Création des classes...');
  
  for (const cls of SEED_DATA.classes) {
    await prisma.class.upsert({
      where: { name: cls.name },
      update: {},
      create: cls,
    });
  }
  
  console.log(`✅ ${SEED_DATA.classes.length} classes créées`);
}

async function seedUsers() {
  console.log('👥 Création des utilisateurs...');
  
  // Admin
  const adminPassword = await hash(SEED_DATA.users.admin.password, 12);
  await prisma.user.upsert({
    where: { email: SEED_DATA.users.admin.email },
    update: {},
    create: {
      ...SEED_DATA.users.admin,
      passwordHash: adminPassword,
    },
  });
  
  // Teachers
  for (const teacher of SEED_DATA.users.teachers) {
    const hashedPassword = await hash(teacher.password, 12);
    await prisma.user.upsert({
      where: { email: teacher.email },
      update: {},
      create: {
        ...teacher,
        passwordHash: hashedPassword,
      },
    });
  }
  
  // Students
  for (const student of SEED_DATA.users.students) {
    const hashedPassword = await hash(student.password, 12);
    const cls = await prisma.class.findUnique({
      where: { name: student.className },
    });
    
    await prisma.user.upsert({
      where: { email: student.email },
      update: {},
      create: {
        email: student.email,
        passwordHash: hashedPassword,
        firstName: student.firstName,
        lastName: student.lastName,
        role: student.role,
        // Créer enrollment si classe existe
        ...(cls && {
          enrollments: {
            create: { classId: cls.id },
          },
        }),
      },
    });
  }
  
  const totalUsers = 1 + SEED_DATA.users.teachers.length + SEED_DATA.users.students.length;
  console.log(`✅ ${totalUsers} utilisateurs créés`);
}

async function seedCourses() {
  console.log('📖 Création des cours...');
  
  for (const course of SEED_DATA.courses) {
    const subject = await prisma.subject.findUnique({
      where: { name: course.subjectName },
    });
    const teacher = await prisma.user.findUnique({
      where: { email: course.teacherEmail },
    });
    
    if (!subject || !teacher) {
      console.warn(`⚠️  Cours "${course.title}" ignoré (subject ou teacher manquant)`);
      continue;
    }
    
    await prisma.course.create({
      data: {
        title: course.title,
        description: course.description,
        subjectId: subject.id,
        teacherId: teacher.id,
        chapters: {
          create: course.chapters.map((ch) => ({
            title: ch.title,
            order: ch.order,
            content: `# ${ch.title}\n\nContenu à compléter...`,
          })),
        },
      },
    });
  }
  
  console.log(`✅ ${SEED_DATA.courses.length} cours créés`);
}

// -----------------------------------------------------
// MAIN
// -----------------------------------------------------

async function main() {
  console.log('🌱 Démarrage du seed BlaizBot...\n');
  
  try {
    // Optionnel : nettoyer avant
    // await clearDatabase();
    
    await seedSubjects();
    await seedClasses();
    await seedUsers();
    await seedCourses();
    
    console.log('\n✅ Seed terminé avec succès !');
    console.log('\n📋 Comptes de test :');
    console.log('   Admin    : admin@blaizbot.edu / admin123');
    console.log('   Prof     : m.dupont@blaizbot.edu / prof123');
    console.log('   Élève    : lucas.martin@blaizbot.edu / eleve123');
  } catch (error) {
    console.error('❌ Erreur pendant le seed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
