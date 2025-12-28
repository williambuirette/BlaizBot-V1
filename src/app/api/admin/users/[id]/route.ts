import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

// Schéma de validation pour la mise à jour (align on Prisma schema)
const updateUserSchema = z.object({
  email: z.string().email('Email invalide').optional(),
  firstName: z.string().min(2, 'Prénom trop court').optional(),
  lastName: z.string().min(2, 'Nom trop court').optional(),
  password: z.string().min(6, 'Mot de passe trop court').optional(),
  role: z.enum(['ADMIN', 'TEACHER', 'STUDENT']).optional(),
});

type Params = { params: Promise<{ id: string }> };

// Selection fields for user queries
const userSelectFields = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  createdAt: true,
};

// GET /api/admin/users/[id] - Récupérer un utilisateur
export async function GET(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: userSelectFields,
  });

  if (!user) {
    return Response.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
  }

  return Response.json(user);
}

// PUT /api/admin/users/[id] - Modifier un utilisateur
export async function PUT(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const data = updateUserSchema.parse(body);

    // Vérifier si l'utilisateur existe
    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return Response.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Si changement d'email, vérifier unicité
    if (data.email && data.email !== existingUser.email) {
      const emailTaken = await prisma.user.findUnique({
        where: { email: data.email },
      });
      if (emailTaken) {
        return Response.json(
          { error: 'Cet email est déjà utilisé' },
          { status: 400 }
        );
      }
    }

    // Préparer les données de mise à jour (align on Prisma schema)
    const updateData: Record<string, unknown> = {};
    if (data.email) updateData.email = data.email;
    if (data.firstName) updateData.firstName = data.firstName;
    if (data.lastName) updateData.lastName = data.lastName;
    if (data.role) updateData.role = data.role;
    if (data.password) {
      updateData.passwordHash = await bcrypt.hash(data.password, 10);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: userSelectFields,
    });

    return Response.json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error updating user:', error);
    return Response.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 });
  }
}

// DELETE /api/admin/users/[id] - Supprimer un utilisateur
export async function DELETE(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return Response.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Empêcher la suppression du dernier admin
    if (user.role === 'ADMIN') {
      const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
      if (adminCount <= 1) {
        return Response.json(
          { error: 'Impossible de supprimer le dernier administrateur' },
          { status: 400 }
        );
      }
    }

    // Empêcher l'auto-suppression
    if (id === session.user.id) {
      return Response.json(
        { error: 'Vous ne pouvez pas supprimer votre propre compte' },
        { status: 400 }
      );
    }

    await prisma.user.delete({ where: { id } });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return Response.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
  }
}
