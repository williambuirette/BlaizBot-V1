import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

// Schéma de validation pour la création d'un utilisateur
const createUserSchema = z.object({
  email: z.string().email('Email invalide'),
  firstName: z.string().min(2, 'Prénom trop court'),
  lastName: z.string().min(2, 'Nom trop court'),
  password: z.string().min(6, 'Mot de passe trop court (min 6 caractères)'),
  role: z.enum(['ADMIN', 'TEACHER', 'STUDENT']),
  phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  postalCode: z.string().nullable().optional(),
});

// GET /api/admin/users - Liste tous les utilisateurs
export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      phone: true,
      address: true,
      city: true,
      postalCode: true,
      isActive: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return Response.json(users);
}

// POST /api/admin/users - Créer un utilisateur
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = createUserSchema.parse(body);

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return Response.json(
        { error: 'Un utilisateur avec cet email existe déjà' },
        { status: 400 }
      );
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    // Générer l'id utilisateur
    const id = `user-${data.email.split('@')[0]}-${Date.now()}`;
    const now = new Date();

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        id,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        passwordHash: hashedPassword,
        role: data.role,
        phone: data.phone,
        address: data.address,
        city: data.city,
        postalCode: data.postalCode,
        updatedAt: now,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        address: true,
        city: true,
        postalCode: true,
        isActive: true,
        createdAt: true,
      },
    });

    return Response.json(user, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error creating user:', error);
    return Response.json(
      { error: 'Erreur lors de la création' },
      { status: 500 }
    );
  }
}
