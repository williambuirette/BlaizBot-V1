// Script temporaire pour mettre à jour les couleurs des classes
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const CLASS_COLORS: Record<string, string> = {
  '3ème A': '#ef4444',  // Rouge
  '3ème B': '#6366f1',  // Indigo
  '4ème A': '#10b981',  // Vert
  '6ème A': '#3b82f6',  // Bleu
  '6ème B': '#8b5cf6',  // Violet
  '5ème A': '#ec4899',  // Rose
  '5ème B': '#f59e0b',  // Orange
  '4ème B': '#06b6d4',  // Cyan
}

async function main() {
  console.log('🎨 Mise à jour des couleurs des classes...')
  
  const classes = await prisma.class.findMany()
  
  for (const cls of classes) {
    const color = CLASS_COLORS[cls.name] || '#3b82f6'
    await prisma.class.update({
      where: { id: cls.id },
      data: { color }
    })
    console.log(`✅ ${cls.name} → ${color}`)
  }
  
  console.log('✅ Couleurs mises à jour avec succès!')
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
