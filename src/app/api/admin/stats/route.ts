import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [users, classes, subjects, courses] = await Promise.all([
    prisma.user.count(),
    prisma.class.count(),
    prisma.subject.count(),
    prisma.course.count(),
  ]);

  return Response.json({ users, classes, subjects, courses });
}
