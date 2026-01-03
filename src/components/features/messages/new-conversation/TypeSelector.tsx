// Sélecteur de type de conversation (cards visuelles)

'use client';

import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Users, User, School } from 'lucide-react';
import type { ConversationType } from './types';

interface TypeSelectorProps {
  value: ConversationType;
  onChange: (value: ConversationType) => void;
}

export function TypeSelector({ value, onChange }: TypeSelectorProps) {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Type de message</Label>
      <RadioGroup
        value={value}
        onValueChange={(v) => onChange(v as ConversationType)}
        className="grid grid-cols-3 gap-3"
      >
        <TypeCard
          id="individual"
          icon={User}
          title="Un élève"
          description="Message privé"
          selected={value === 'individual'}
        />
        <TypeCard
          id="group"
          icon={Users}
          title="Plusieurs élèves"
          description="Groupe personnalisé"
          selected={value === 'group'}
        />
        <TypeCard
          id="class"
          icon={School}
          title="Classe entière"
          description="Tous les élèves"
          selected={value === 'class'}
        />
      </RadioGroup>
    </div>
  );
}

interface TypeCardProps {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  selected: boolean;
}

function TypeCard({ id, icon: Icon, title, description, selected }: TypeCardProps) {
  return (
    <Label
      htmlFor={id}
      className={`flex flex-col items-center gap-2 p-4 border-2 rounded-lg cursor-pointer transition-all ${
        selected 
          ? 'border-primary bg-primary/5' 
          : 'border-muted hover:border-muted-foreground/50'
      }`}
    >
      <RadioGroupItem value={id} id={id} className="sr-only" />
      <Icon className={`h-8 w-8 ${selected ? 'text-primary' : 'text-muted-foreground'}`} />
      <span className={`font-medium ${selected ? 'text-primary' : ''}`}>
        {title}
      </span>
      <span className="text-xs text-muted-foreground text-center">
        {description}
      </span>
    </Label>
  );
}
