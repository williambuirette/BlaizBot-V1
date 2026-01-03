// Aperçu des exercices en mode preview

'use client';

import type { ExerciseItem } from './types';

interface ExercisePreviewProps {
  title: string;
  instructions: string;
  items: ExerciseItem[];
  timeLimit?: number;
  totalPoints: number;
}

export function ExercisePreview({ 
  title, 
  instructions, 
  items, 
  timeLimit, 
  totalPoints 
}: ExercisePreviewProps) {
  return (
    <div className="space-y-6 p-4 bg-muted/30 rounded-lg">
      <div>
        <h3 className="font-semibold text-lg mb-2">{title}</h3>
        {timeLimit && (
          <p className="text-sm text-muted-foreground mb-2">
            ⏱️ Temps limite : {timeLimit} minutes | Points : {totalPoints}
          </p>
        )}
        <div className="prose prose-sm max-w-none">
          <p className="whitespace-pre-wrap">{instructions}</p>
        </div>
      </div>
      <hr />
      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={item.id} className="space-y-2">
            <p className="font-medium">
              {index + 1}. {item.question}
              {item.points && (
                <span className="text-muted-foreground text-sm ml-2">
                  ({item.points} pt{item.points > 1 ? 's' : ''})
                </span>
              )}
            </p>
            {item.hint && (
              <p className="text-sm text-muted-foreground italic">
                💡 Indice : {item.hint}
              </p>
            )}
            <div className="ml-4 p-2 bg-green-50 dark:bg-green-900/20 rounded border-l-2 border-green-500">
              <p className="text-sm">
                <strong>Réponse :</strong> {item.answer}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
