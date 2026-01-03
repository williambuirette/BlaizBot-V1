// Popover avec liste des élèves assignés

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Users, User, ChevronDown } from 'lucide-react';

interface StudentProgress {
  id: string;
  studentId: string;
  status: string;
  User?: { id: string; firstName: string; lastName: string };
}

interface StudentsListPopoverProps {
  studentProgress: StudentProgress[];
}

export function StudentsListPopover({ studentProgress }: StudentsListPopoverProps) {
  const [open, setOpen] = useState(false);

  if (!studentProgress || studentProgress.length === 0) {
    return null;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button
          variant="ghost"
          size="sm"
          className="h-5 px-1 -ml-1 hover:bg-blue-100"
        >
          <ChevronDown className="h-3 w-3 text-blue-600" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-64 p-3" 
        align="start"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-2">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <Users className="h-4 w-4" />
            Élèves assignés ({studentProgress.length})
          </h4>
          <div className="max-h-64 overflow-y-auto space-y-1">
            {studentProgress
              .filter(p => p.User)
              .sort((a, b) => {
                const nameA = `${a.User?.lastName} ${a.User?.firstName}`;
                const nameB = `${b.User?.lastName} ${b.User?.firstName}`;
                return nameA.localeCompare(nameB);
              })
              .map((progress) => (
                <div
                  key={progress.id}
                  className="flex items-center justify-between p-2 rounded hover:bg-muted text-sm"
                >
                  <div className="flex items-center gap-2">
                    <User className="h-3 w-3 text-muted-foreground" />
                    <span>
                      {progress.User?.firstName} {progress.User?.lastName}
                    </span>
                  </div>
                  <Badge 
                    variant="outline" 
                    className="text-[10px] px-1 py-0"
                  >
                    {progress.status === 'COMPLETED' ? '✓' : 
                     progress.status === 'IN_PROGRESS' ? '⏳' : '○'}
                  </Badge>
                </div>
              ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
