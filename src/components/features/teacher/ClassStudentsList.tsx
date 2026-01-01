'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, ArrowUpDown, MoreHorizontal, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SendMessageModal } from '@/components/features/messages/SendMessageModal';

interface StudentData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  aiAverage: number | null;
  aiSessionsCount?: number;
}

interface ClassStudentsListProps {
  students: StudentData[];
  className: string;
}

type SortKey = 'name' | 'aiAverage' | 'aiSessionsCount';

// Composant SortableHeader extrait pour éviter re-création pendant le render
interface SortableHeaderProps {
  sortKey: SortKey;
  children: React.ReactNode;
  onSort: (key: SortKey) => void;
}

function SortableHeader({ sortKey, children, onSort }: SortableHeaderProps) {
  return (
    <TableHead>
      <Button
        variant="ghost"
        onClick={() => onSort(sortKey)}
        className="h-auto p-0 hover:bg-transparent"
      >
        {children}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    </TableHead>
  );
}

export function ClassStudentsList({ students, className }: ClassStudentsListProps) {
  const router = useRouter();
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  // Filtrer d'abord par recherche
  const filteredStudents = students.filter((student) => {
    if (!searchQuery) return true;
    const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
    const email = student.email.toLowerCase();
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || email.includes(query);
  });

  // Puis trier
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    let aValue: string | number = 0;
    let bValue: string | number = 0;

    switch (sortKey) {
      case 'name':
        aValue = `${a.firstName} ${a.lastName}`;
        bValue = `${b.firstName} ${b.lastName}`;
        break;
      case 'aiAverage':
        aValue = a.aiAverage ?? -1;
        bValue = b.aiAverage ?? -1;
        break;
      case 'aiSessionsCount':
        aValue = a.aiSessionsCount ?? -1;
        bValue = b.aiSessionsCount ?? -1;
        break;
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRowIds(filteredStudents.map((s) => s.id));
    } else {
      setSelectedRowIds([]);
    }
  };

  const handleSelectRow = (rowId: string, checked: boolean) => {
    if (checked) {
      setSelectedRowIds((prev) => [...prev, rowId]);
    } else {
      setSelectedRowIds((prev) => prev.filter((id) => id !== rowId));
    }
  };

  const isAllSelected = selectedRowIds.length === filteredStudents.length && filteredStudents.length > 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Liste des élèves ({students.length})</CardTitle>
        {selectedRowIds.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {selectedRowIds.length} sélectionné(s)
            </span>
            <Button>Lancer une analyse IA</Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {/* Champ de recherche */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un élève par nom ou email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          {searchQuery && (
            <p className="text-sm text-muted-foreground mt-2">
              {filteredStudents.length} résultat(s) trouvé(s)
            </p>
          )}
        </div>
        {students.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Aucun élève inscrit dans cette classe.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
                <SortableHeader sortKey="name" onSort={handleSort}>Nom</SortableHeader>
                <SortableHeader sortKey="aiAverage" onSort={handleSort}>Score IA</SortableHeader>
                <SortableHeader sortKey="aiSessionsCount" onSort={handleSort}>Sessions IA</SortableHeader>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedStudents.map((student) => (
                <TableRow 
                  key={student.id}
                  data-state={selectedRowIds.includes(student.id) && "selected"}
                >
                  <TableCell className="w-10">
                    <Checkbox
                      checked={selectedRowIds.includes(student.id)}
                      onCheckedChange={(checked) => handleSelectRow(student.id, !!checked)}
                      aria-label={`Select row for ${student.firstName}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    <Link href={`/teacher/students/${student.id}`} className="hover:underline text-blue-600">
                      {student.firstName} {student.lastName}
                    </Link>
                    <p className="text-sm text-muted-foreground">{student.email}</p>
                  </TableCell>
                  <TableCell>
                    {student.aiAverage !== null && student.aiAverage !== undefined ? (
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300 gap-1">
                        <Bot className="h-3 w-3" />
                        {student.aiAverage}%
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {student.aiSessionsCount !== null && student.aiSessionsCount !== undefined ? (
                       <span className="font-mono text-sm">{student.aiSessionsCount}</span>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/teacher/students/${student.id}`)}>
                          Voir détails
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setSelectedStudent(student);
                          setMessageModalOpen(true);
                        }}>
                          Envoyer un message
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* Modal d'envoi de message */}
      {selectedStudent && (
        <SendMessageModal
          isOpen={messageModalOpen}
          onClose={() => {
            setMessageModalOpen(false);
            setSelectedStudent(null);
          }}
          studentId={selectedStudent.id}
          studentName={`${selectedStudent.firstName} ${selectedStudent.lastName}`}
          studentEmail={selectedStudent.email}
        />
      )}
    </Card>
  );
}
