// src/components/features/courses/ProgressSheet.tsx
// Sheet pour afficher la progression détaillée d'une assignation

'use client';

import React, { useState, useCallback } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Eye,
  Mail,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  BarChart3,
} from 'lucide-react';

// Types
type ProgressStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'GRADED';

interface StudentProgressItem {
  id: string;
  studentId: string;
  status: ProgressStatus;
  score: number | null;
  completedAt: string | null;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface Assignment {
  id: string;
  title: string;
  dueDate: string | null;
  stats?: {
    total: number;
    completed: number;
    inProgress: number;
    notStarted: number;
    completionRate: number;
  };
}

interface ProgressSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignment: Assignment;
}

// Status config
const statusConfig = {
  NOT_STARTED: {
    label: 'Pas commencé',
    icon: AlertCircle,
    color: 'bg-gray-100 text-gray-800',
  },
  IN_PROGRESS: {
    label: 'En cours',
    icon: Clock,
    color: 'bg-blue-100 text-blue-800',
  },
  COMPLETED: {
    label: 'Terminé',
    icon: CheckCircle,
    color: 'bg-green-100 text-green-800',
  },
  GRADED: {
    label: 'Noté',
    icon: CheckCircle,
    color: 'bg-purple-100 text-purple-800',
  },
};

export function ProgressSheet({
  open,
  onOpenChange,
  assignment,
}: ProgressSheetProps) {
  const [progress, setProgress] = useState<StudentProgressItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<ProgressStatus | 'all'>('all');

  // Fetch progress
  const fetchProgress = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/teacher/assignments/${assignment.id}/progress`);
      if (res.ok) {
        const data = await res.json();
        setProgress(data);
      }
    } catch (error) {
      console.error('Erreur fetch progress:', error);
    }
    setLoading(false);
  }, [assignment.id]);

  // Ref pour tracker si les données ont été chargées pour cet assignment
  const loadedAssignmentIdRef = React.useRef<string | null>(null);

  // Charger les données une fois quand le sheet s'ouvre (via ref, pas state)
  React.useEffect(() => {
    if (open && loadedAssignmentIdRef.current !== assignment.id) {
      loadedAssignmentIdRef.current = assignment.id;
      fetchProgress();
    }
    if (!open) {
      loadedAssignmentIdRef.current = null;
    }
  }, [open, assignment.id, fetchProgress]);

  // Filter progress
  const filteredProgress = progress.filter((p) => {
    if (statusFilter === 'all') return true;
    return p.status === statusFilter;
  });

  // Calculate stats
  const stats = {
    total: progress.length,
    notStarted: progress.filter((p) => p.status === 'NOT_STARTED').length,
    inProgress: progress.filter((p) => p.status === 'IN_PROGRESS').length,
    completed: progress.filter((p) => p.status === 'COMPLETED' || p.status === 'GRADED').length,
    averageScore:
      progress.filter((p) => p.score !== null).reduce((sum, p) => sum + (p.score || 0), 0) /
        (progress.filter((p) => p.score !== null).length || 1) || 0,
  };

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Progression : {assignment.title}
          </SheetTitle>
        </SheetHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="py-6 space-y-6">
            {/* Global Stats */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Progression globale</span>
                <span className="text-sm text-muted-foreground">
                  {stats.completed}/{stats.total} ({completionRate}%)
                </span>
              </div>
              <Progress value={completionRate} className="h-3" />

              {/* Stats breakdown */}
              <div className="grid grid-cols-4 gap-2 pt-2">
                <div className="text-center p-2 rounded bg-gray-50">
                  <div className="text-lg font-semibold">{stats.notStarted}</div>
                  <div className="text-xs text-muted-foreground">Pas commencé</div>
                </div>
                <div className="text-center p-2 rounded bg-blue-50">
                  <div className="text-lg font-semibold text-blue-700">{stats.inProgress}</div>
                  <div className="text-xs text-muted-foreground">En cours</div>
                </div>
                <div className="text-center p-2 rounded bg-green-50">
                  <div className="text-lg font-semibold text-green-700">{stats.completed}</div>
                  <div className="text-xs text-muted-foreground">Terminé</div>
                </div>
                <div className="text-center p-2 rounded bg-purple-50">
                  <div className="text-lg font-semibold text-purple-700">
                    {stats.averageScore > 0 ? `${Math.round(stats.averageScore)}/100` : '-'}
                  </div>
                  <div className="text-xs text-muted-foreground">Moyenne</div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="NOT_STARTED">Pas commencé</SelectItem>
                  <SelectItem value="IN_PROGRESS">En cours</SelectItem>
                  <SelectItem value="COMPLETED">Terminé</SelectItem>
                  <SelectItem value="GRADED">Noté</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Students Table */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Élève</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProgress.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        Aucun élève trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProgress.map((item) => {
                      const config = statusConfig[item.status];
                      const StatusIcon = config.icon;

                      return (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {item.student.firstName} {item.student.lastName}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {item.student.email}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${config.color} flex items-center gap-1 w-fit`}>
                              <StatusIcon className="h-3 w-3" />
                              {config.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {item.score !== null ? (
                              <span className="font-medium">{item.score}/100</span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" title="Voir le travail">
                                <Eye className="h-4 w-4" />
                              </Button>
                              {item.status === 'NOT_STARTED' && (
                                <Button variant="ghost" size="icon" className="h-8 w-8" title="Envoyer un rappel">
                                  <Mail className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
