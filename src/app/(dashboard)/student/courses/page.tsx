'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { StudentCoursesStatsHeader, StudentCoursesOverview } from '@/components/features/student/StudentCoursesStatsHeader';
import { StudentCoursesTable, StudentCourseData } from '@/components/features/student/StudentCoursesTable';
import { StudentCoursesFilters } from '@/components/features/student/StudentCoursesFiltersMulti';

interface FilterOption {
  id: string;
  name: string;
}

interface FiltersData {
  subjects: FilterOption[];
  teachers: FilterOption[];
}

export default function StudentCoursesPage() {
  const [courses, setCourses] = useState<StudentCourseData[]>([]);
  const [overview, setOverview] = useState<StudentCoursesOverview | null>(null);
  const [filters, setFilters] = useState<FiltersData>({ subjects: [], teachers: [] });
  const [loading, setLoading] = useState(true);

  // États des filtres (multi-select)
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState('all');

  const fetchCourses = useCallback(async () => {
    try {
      const res = await fetch('/api/student/courses');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setCourses(data.data.courses || []);
          setOverview(data.data.overview || null);
          setFilters(data.data.filters || { subjects: [], teachers: [] });
        }
      }
    } catch (error) {
      console.error('Erreur fetch courses:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Filtrage côté client avec multi-select
  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      // Filtre professeur (multi)
      if (selectedTeachers.length > 0 && !selectedTeachers.includes(course.teacher.id)) {
        return false;
      }
      // Filtre matière (multi)
      if (selectedSubjects.length > 0 && !selectedSubjects.includes(course.subject.id)) {
        return false;
      }
      // Filtre thématique (multi) - vérifie uniquement le titre du cours
      if (selectedThemes.length > 0 && !selectedThemes.includes(course.title)) {
        return false;
      }
      // Filtre statut (single)
      if (selectedStatus !== 'all' && course.status !== selectedStatus) {
        return false;
      }
      return true;
    });
  }, [courses, selectedTeachers, selectedSubjects, selectedThemes, selectedStatus]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mes Cours</h1>
        <p className="text-muted-foreground">
          Accédez à vos cours et suivez votre progression.
        </p>
      </div>

      {/* Header avec statistiques */}
      {overview && <StudentCoursesStatsHeader overview={overview} />}

      {/* Filtres multi-select */}
      <StudentCoursesFilters
        subjects={filters.subjects}
        teachers={filters.teachers}
        courses={courses}
        selectedSubjects={selectedSubjects}
        selectedTeachers={selectedTeachers}
        selectedThemes={selectedThemes}
        selectedStatus={selectedStatus}
        onSubjectsChange={setSelectedSubjects}
        onTeachersChange={setSelectedTeachers}
        onThemesChange={setSelectedThemes}
        onStatusChange={setSelectedStatus}
      />

      {/* Table des cours */}
      <StudentCoursesTable courses={filteredCourses} />
    </div>
  );
}
