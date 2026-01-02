/**
 * Formulaire de création d'un supplément
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Book, User } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface Course {
  id: string;
  title: string;
  subject: string;
  teacher: string | null;
}

interface CreateSupplementFormProps {
  courses: Course[];
}

export function CreateSupplementForm({ courses }: CreateSupplementFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'linked' | 'personal'>('personal');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || title.trim().length < 3) {
      setError('Le titre doit contenir au moins 3 caractères');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/student/supplements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          courseId: type === 'linked' ? selectedCourseId || null : null,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || 'Erreur lors de la création');
        return;
      }

      // Rediriger vers la page du supplément créé
      router.push(`/student/revisions/${data.data.id}`);
    } catch (err) {
      console.error('Erreur création:', err);
      setError('Erreur réseau');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link href="/student/revisions">
              <Button variant="ghost" size="icon" type="button">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            Créer un supplément
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Titre */}
          <div className="space-y-2">
            <Label htmlFor="title">Titre *</Label>
            <Input
              id="title"
              placeholder="Ex: Mes notes de Maths, Prépa BAC..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              minLength={3}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (optionnel)</Label>
            <Textarea
              id="description"
              placeholder="Décrivez le contenu de ce supplément..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Type de supplément */}
          <div className="space-y-3">
            <Label>Type de supplément</Label>
            <RadioGroup
              value={type}
              onValueChange={(v) => setType(v as 'linked' | 'personal')}
              className="space-y-2"
            >
              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                <RadioGroupItem value="personal" id="personal" />
                <Label htmlFor="personal" className="flex items-center gap-2 cursor-pointer flex-1">
                  <User className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="font-medium">Cours personnel</p>
                    <p className="text-sm text-muted-foreground">
                      Indépendant, pour vos révisions libres
                    </p>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                <RadioGroupItem value="linked" id="linked" />
                <Label htmlFor="linked" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Book className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium">Lié à un cours</p>
                    <p className="text-sm text-muted-foreground">
                      Notes complémentaires à un cours du prof
                    </p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Sélection du cours (si lié) */}
          {type === 'linked' && (
            <div className="space-y-2">
              <Label htmlFor="course">Cours associé</Label>
              <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un cours..." />
                </SelectTrigger>
                <SelectContent>
                  {courses.length === 0 ? (
                    <SelectItem value="" disabled>
                      Aucun cours disponible
                    </SelectItem>
                  ) : (
                    courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title} ({course.subject})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Erreur */}
          {error && (
            <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">
              {error}
            </p>
          )}
        </CardContent>

        <CardFooter className="flex justify-end gap-3">
          <Link href="/student/revisions">
            <Button variant="outline" type="button">
              Annuler
            </Button>
          </Link>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Création...' : 'Créer le supplément'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
