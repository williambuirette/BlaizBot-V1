const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Connexion BDD OK');
    
    const result = await prisma.aIActivityScore.findMany({ take: 1 });
    console.log('✅ Modèle AIActivityScore accessible:', result.length === 0 ? 'Table vide (normal)' : result.length + ' entrées');
    
    // Vérifier aussi StudentScore
    const scores = await prisma.studentScore.findMany({ take: 1 });
    console.log('✅ Modèle StudentScore accessible:', scores.length + ' entrées');
    
  } catch (err) {
    console.error('❌ Erreur:', err.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
