import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { z } from 'zod';

const generateCourseSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  objectives: z.array(z.string()).optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
  instructions: z.string().optional(),
  files: z.array(z.object({
    filename: z.string(),
    url: z.string(),
    type: z.string(),
  })).optional(),
});

const difficultyLabels = {
  EASY: 'débutant',
  MEDIUM: 'intermédiaire',
  HARD: 'avancé',
};

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }
    if (session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Accès réservé aux professeurs' }, { status: 403 });
    }

    const body = await request.json();
    const validation = generateCourseSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { title, description, objectives, difficulty, instructions, files } = validation.data;

    // Construire le prompt pour l'IA
    const systemPrompt = `Tu es un assistant pédagogique expert qui aide les professeurs à créer des cours de qualité.
Tu génères du contenu HTML bien structuré pour un éditeur de texte riche.

Règles de formatage :
- Utilise des balises HTML : <h1>, <h2>, <h3>, <p>, <ul>, <ol>, <li>, <strong>, <em>, <blockquote>
- Structure le cours avec des sections claires
- Inclus des exemples concrets
- Adapte le niveau au public cible
- Rends le contenu engageant et pédagogique`;

    const userPrompt = buildUserPrompt({
      title,
      description,
      objectives,
      difficulty,
      instructions,
      files,
    });

    // Appel à l'API OpenAI (ou autre fournisseur configuré)
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      // Mode démo : générer un contenu de démonstration
      const demoContent = generateDemoContent(title, description, objectives, difficulty);
      return NextResponse.json({ content: demoContent });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      console.error('Erreur OpenAI:', await response.text());
      // Fallback vers le contenu de démo
      const demoContent = generateDemoContent(title, description, objectives, difficulty);
      return NextResponse.json({ content: demoContent });
    }

    const data = await response.json();
    const generatedContent = data.choices[0]?.message?.content || '';

    return NextResponse.json({ content: generatedContent });
  } catch (error) {
    console.error('Erreur API generate-course:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

function buildUserPrompt({
  title,
  description,
  objectives,
  difficulty,
  instructions,
  files,
}: {
  title: string;
  description?: string;
  objectives?: string[];
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  instructions?: string;
  files?: { filename: string; url: string; type: string }[];
}) {
  let prompt = `Génère un cours complet sur le sujet suivant :

**Titre** : ${title}`;

  if (description) {
    prompt += `\n**Description** : ${description}`;
  }

  if (difficulty) {
    prompt += `\n**Niveau** : ${difficultyLabels[difficulty]}`;
  }

  if (objectives && objectives.length > 0) {
    prompt += `\n**Objectifs pédagogiques** :\n${objectives.map((o) => `- ${o}`).join('\n')}`;
  }

  if (files && files.length > 0) {
    prompt += `\n\n**Documents de référence fournis** :\n${files.map((f) => `- ${f.filename} (${f.type})`).join('\n')}`;
    prompt += `\n\nBase le contenu sur ces documents si pertinent.`;
  }

  if (instructions) {
    prompt += `\n\n**Instructions supplémentaires du professeur** :\n${instructions}`;
  }

  prompt += `

Génère un cours structuré en HTML avec :
1. Une introduction engageante
2. Plusieurs sections avec des sous-titres (H2, H3)
3. Des explications claires avec des exemples
4. Des points clés à retenir
5. Une conclusion ou résumé

Retourne uniquement le HTML du cours, sans balises <html>, <body> ou <head>.`;

  return prompt;
}

function generateDemoContent(
  title: string,
  description?: string,
  objectives?: string[],
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD'
): string {
  const level = difficulty ? difficultyLabels[difficulty] : 'intermédiaire';
  
  return `<h1>${title}</h1>

<p><em>Niveau : ${level}</em></p>

<h2>Introduction</h2>
<p>${description || `Bienvenue dans ce cours sur <strong>${title}</strong>. Ce module vous permettra d'acquérir les connaissances essentielles sur ce sujet.`}</p>

${objectives && objectives.length > 0 ? `
<h2>Objectifs du cours</h2>
<p>À la fin de ce cours, vous serez capable de :</p>
<ul>
${objectives.map((o) => `  <li>${o}</li>`).join('\n')}
</ul>
` : ''}

<h2>1. Concepts fondamentaux</h2>
<p>Commençons par explorer les bases de ce sujet. Il est important de bien comprendre ces concepts avant d'aller plus loin.</p>

<blockquote>
<p>💡 <strong>Point clé</strong> : La compréhension des fondamentaux est essentielle pour maîtriser les concepts avancés.</p>
</blockquote>

<h3>1.1 Définitions</h3>
<p>Voici les termes importants à connaître :</p>
<ul>
  <li><strong>Terme 1</strong> : Description du premier terme</li>
  <li><strong>Terme 2</strong> : Description du second terme</li>
  <li><strong>Terme 3</strong> : Description du troisième terme</li>
</ul>

<h2>2. Mise en pratique</h2>
<p>Maintenant que nous avons vu la théorie, passons à la pratique avec quelques exemples concrets.</p>

<h3>2.1 Exemple pratique</h3>
<p>Prenons un cas concret pour illustrer ces concepts...</p>

<h2>3. Résumé et points à retenir</h2>
<p>Voici les éléments essentiels à retenir de ce cours :</p>
<ol>
  <li>Premier point important</li>
  <li>Deuxième point important</li>
  <li>Troisième point important</li>
</ol>

<hr>

<p><em>⚠️ Ce contenu a été généré automatiquement. Veuillez le personnaliser selon vos besoins pédagogiques.</em></p>`;
}
