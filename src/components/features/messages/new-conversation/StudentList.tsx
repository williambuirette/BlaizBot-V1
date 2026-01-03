// Liste des élèves avec sélection

'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { User, Loader2 } from 'lucide-react';
import type { StudentOption, ConversationType } from './types';

interface StudentListProps {
  type: ConversationType;
  students: StudentOption[];
  selectedStudents: string[];
  loading: boolean;
  onToggle: (userId: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

export function StudentList({
  type,
  students,
  selectedStudents,
  loading,
  onToggle,
  onSelectAll,
  onDeselectAll,
}: StudentListProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2">
          <User className="h-4 w-4" />
          {type === 'individual' ? 'Élève' : 'Élèves'} 
          <span className="text-red-500">*</span>
          {type === 'group' && selectedStudents.length > 0 && (
            <span className="text-muted-foreground text-sm">
              ({selectedStudents.length} sélectionné{selectedStudents.length > 1 ? 's' : ''})
            </span>
          )}
        </Label>
        {type === 'group' && students.length > 0 && (
          <div className="flex gap-2">
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={onSelectAll}
              disabled={selectedStudents.length === students.length}
            >
              Tout sélectionner
            </Button>
            <Button 
              type="button"
              variant="outline" 
              size="sm" 
              onClick={onDeselectAll}
              disabled={selectedStudents.length === 0}
            >
              Désélectionner
            </Button>
          </div>
        )}
      </div>
      <ScrollArea className="h-40 border rounded-md">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        ) : students.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Aucun élève dans cette classe
          </p>
        ) : (
          <div className="p-2 space-y-1">
            {students.map((student) => {
              const isSelected = selectedStudents.includes(student.userId);
              return (
                <div
                  key={student.id}
                  className={`flex items-center space-x-3 p-2 rounded-md transition-colors ${
                    isSelected ? 'bg-primary/10' : 'hover:bg-muted'
                  }`}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onToggle(student.userId)}
                  />
                  <div 
                    className="flex-1 min-w-0 cursor-pointer" 
                    onClick={() => onToggle(student.userId)}
                  >
                    <p className="text-sm font-medium">
                      {student.lastName} {student.firstName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {student.email}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
