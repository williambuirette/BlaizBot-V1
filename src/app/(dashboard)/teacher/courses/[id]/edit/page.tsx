import { CourseEditClient } from '@/components/features/teacher/CourseEditClient';

interface EditCoursePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCoursePage({ params }: EditCoursePageProps) {
  const { id } = await params;

  return <CourseEditClient courseId={id} />;
}
