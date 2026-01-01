'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  BookOpen, 
  FileText, 
  Users, 
  GraduationCap, 
  CalendarIcon 
} from 'lucide-react';
import type { Subject, Course, Section, ClassOption, Student } from '../types';
import { PRIORITY_OPTIONS, SECTION_TYPE_ICONS } from '../types';

interface StepValidationProps {
  subjects: Subject[];
  courses: Course[];
  sections: Section[];
  classes: ClassOption[];
  students: Student[];
  selectedSubjects: string[];
  selectedCourses: string[];
  selectedSections: string[];
  selectedClasses: string[];
  selectedStudents: string[];
  dueDate?: Date;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  instructions: string;
}

export function StepValidation({
  subjects,
  courses,
  sections,
  classes,
  students,
  selectedSubjects,
  selectedCourses,
  selectedSections,
  selectedClasses,
  selectedStudents,
  dueDate,
  priority,
  instructions,
}: StepValidationProps) {
  const priorityConfig = PRIORITY_OPTIONS.find((p) => p.value === priority);

  // Get selected item names
  const selectedSubjectNames = subjects
    .filter((s) => selectedSubjects.includes(s.id))
    .map((s) => s.name);

  const selectedCourseNames = courses
    .filter((c) => selectedCourses.includes(c.id))
    .map((c) => c.title);

  const selectedSectionsList = sections.filter((s) =>
    selectedSections.includes(s.id)
  );

  const selectedClassNames = classes
    .filter((c) => selectedClasses.includes(c.id))
    .map((c) => c.name);

  const selectedStudentNames = students
    .filter((s) => selectedStudents.includes(s.id))
    .map((s) => `${s.firstName} ${s.lastName}`);

  // Calculate total assignments to create
  const totalAssignments = selectedSections.length * selectedStudents.length;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium mb-2">Vérifiez votre assignation</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Confirmez les détails avant de créer l&apos;assignation
        </p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Matières &amp; Cours
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {selectedSubjectNames.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {selectedSubjectNames.map((name) => (
                <Badge key={name} variant="outline">
                  {name}
                </Badge>
              ))}
            </div>
          )}
          <div className="flex flex-wrap gap-1">
            {selectedCourseNames.map((name) => (
              <Badge key={name} variant="secondary">
                {name}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Contenus ({selectedSections.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1">
            {selectedSectionsList.map((section) => {
              const typeInfo = SECTION_TYPE_ICONS[section.type] || {
                icon: '📄',
                label: section.type,
              };
              return (
                <Badge key={section.id} variant="outline" className="gap-1">
                  <span>{typeInfo.icon}</span>
                  {section.title}
                </Badge>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" />
            Classes ({selectedClasses.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1">
            {selectedClassNames.map((name) => (
              <Badge key={name} variant="secondary">
                {name}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Élèves ({selectedStudents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1 max-h-24 overflow-auto">
            {selectedStudentNames.slice(0, 10).map((name) => (
              <Badge key={name} variant="outline">
                {name}
              </Badge>
            ))}
            {selectedStudentNames.length > 10 && (
              <Badge variant="secondary">
                +{selectedStudentNames.length - 10} autres
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            Deadline &amp; Priorité
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {dueDate && (
            <p className="text-sm">
              📅 {format(dueDate, 'EEEE d MMMM yyyy', { locale: fr })}
            </p>
          )}
          {priorityConfig && (
            <Badge variant="outline" className={priorityConfig.color}>
              Priorité {priorityConfig.label}
            </Badge>
          )}
          {instructions && (
            <div className="mt-2">
              <p className="text-xs text-muted-foreground">Instructions :</p>
              <p className="text-sm italic">&quot;{instructions}&quot;</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="bg-muted/50 rounded-lg p-4 text-center">
        <p className="text-lg font-medium">
          {totalAssignments} assignation(s) seront créées
        </p>
        <p className="text-sm text-muted-foreground">
          {selectedSections.length} section(s) × {selectedStudents.length} élève(s)
        </p>
      </div>
    </div>
  );
}
