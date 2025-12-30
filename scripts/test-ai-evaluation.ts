/**
 * Script de test pour le service d'évaluation IA
 * Usage: node --loader ts-node/esm scripts/test-ai-evaluation.ts
 */

import { evaluateQuizSession } from '../src/lib/ai-evaluation-service';

async function testEvaluation() {
  console.log('🧪 Test du service d\'évaluation IA\n');

  // Mock d'une conversation élève-IA
  const chatHistory = [
    { role: 'user', content: 'Bonjour, je voudrais réviser les fractions' },
    {
      role: 'assistant',
      content: 'Bonjour ! Commençons par les fractions. Peux-tu me dire ce qu\'est 1/2 + 1/4 ?',
    },
    { role: 'user', content: 'Euh... 2/6 ?' },
    {
      role: 'assistant',
      content: 'Pas tout à fait. Pour additionner des fractions, il faut un dénominateur commun. Quel serait le dénominateur commun entre 2 et 4 ?',
    },
    { role: 'user', content: 'Ah oui ! C\'est 4. Donc 1/2 = 2/4, et 2/4 + 1/4 = 3/4' },
    {
      role: 'assistant',
      content: 'Excellent ! Tu as bien compris le principe. Essayons maintenant 2/3 + 1/6',
    },
    { role: 'user', content: '2/3 = 4/6, donc 4/6 + 1/6 = 5/6' },
    { role: 'assistant', content: 'Parfait ! Tu maîtrises bien les fractions.' },
  ];

  const quizData = {
    title: 'Additions de fractions',
    questions: ['1/2 + 1/4', '2/3 + 1/6', '3/5 + 1/10'],
  };

  const themeName = 'Fractions - Niveau 6ème';

  try {
    console.log('📊 Évaluation en cours...\n');

    const result = await evaluateQuizSession(chatHistory, quizData, themeName);

    console.log('✅ Résultat de l\'évaluation:\n');
    console.log(`🧠 Compréhension: ${result.comprehension}/100`);
    console.log(`✅ Précision: ${result.accuracy}/100`);
    console.log(`🚀 Autonomie: ${result.autonomy}/100`);
    console.log(`\n💪 Points forts:`);
    result.strengths.forEach((s) => console.log(`   - ${s}`));
    console.log(`\n📝 À améliorer:`);
    result.weaknesses.forEach((w) => console.log(`   - ${w}`));
    console.log(`\n🎯 Recommandation:`);
    console.log(`   ${result.recommendation}`);

    const finalScore =
      result.comprehension * 0.4 + result.accuracy * 0.4 + result.autonomy * 0.2;
    console.log(`\n📈 Score final: ${Math.round(finalScore)}/100`);

    console.log('\n✅ Test réussi !');
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

testEvaluation();
