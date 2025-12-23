import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Routes publiques - ne pas protéger
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico')
  ) {
    return NextResponse.next();
  }

  // Récupérer le token JWT
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });

  // Non connecté → login
  if (!token) {
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  const role = token.role as string;

  // Route racine → rediriger selon le rôle
  if (pathname === '/') {
    const roleRoutes: Record<string, string> = {
      ADMIN: '/admin',
      TEACHER: '/teacher',
      STUDENT: '/student',
    };
    const redirectUrl = roleRoutes[role] || '/login';
    return NextResponse.redirect(new URL(redirectUrl, req.url));
  }

  // RBAC - vérifier l'accès aux routes protégées
  if (pathname.startsWith('/admin') && role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }
  if (pathname.startsWith('/teacher') && role !== 'TEACHER') {
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }
  if (pathname.startsWith('/student') && role !== 'STUDENT') {
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
