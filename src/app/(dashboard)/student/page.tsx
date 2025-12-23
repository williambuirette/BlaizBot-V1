import { currentUser, courses, studentProgress } from '@/data/mockData';
import { WelcomeCard, StatsCards, RecentCourses } from '@/components/dashboard';

export default function StudentDashboardPage() {
  const firstName = currentUser.name.split(' ')[0] ?? currentUser.name;
  return (
    <div className="space-y-6">
      <WelcomeCard userName={firstName} />
      <StatsCards stats={studentProgress} />
      <RecentCourses courses={courses} />
    </div>
  );
}
