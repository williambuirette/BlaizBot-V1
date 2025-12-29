'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Mail, Phone, MapPin, User, Users } from 'lucide-react';

interface StudentDetails {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  postalCode?: string | null;
  parentEmail?: string | null;
  classes: string[];
  isActive?: boolean;
}

interface StudentDetailsDialogProps {
  student: StudentDetails;
}

export function StudentDetailsDialog({ student }: StudentDetailsDialogProps) {
  const fullAddress = [student.address, student.postalCode, student.city]
    .filter(Boolean)
    .join(', ');

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" title="Voir les détails">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {student.firstName} {student.lastName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Classes */}
          <div className="flex items-start gap-3">
            <Users className="h-4 w-4 mt-1 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Classes</p>
              <div className="flex gap-1 flex-wrap mt-1">
                {student.classes.map((className) => (
                  <Badge key={className} variant="secondary">
                    {className}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-start gap-3">
            <Mail className="h-4 w-4 mt-1 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <a
                href={`mailto:${student.email}`}
                className="text-sm text-primary hover:underline"
              >
                {student.email}
              </a>
            </div>
          </div>

          {/* Téléphone */}
          {student.phone && (
            <div className="flex items-start gap-3">
              <Phone className="h-4 w-4 mt-1 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Téléphone</p>
                <a
                  href={`tel:${student.phone}`}
                  className="text-sm text-primary hover:underline"
                >
                  {student.phone}
                </a>
              </div>
            </div>
          )}

          {/* Adresse */}
          {fullAddress && (
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Adresse</p>
                <p className="text-sm">{fullAddress}</p>
              </div>
            </div>
          )}

          {/* Email parent */}
          {student.parentEmail && (
            <div className="flex items-start gap-3">
              <Mail className="h-4 w-4 mt-1 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email du parent</p>
                <a
                  href={`mailto:${student.parentEmail}`}
                  className="text-sm text-primary hover:underline"
                >
                  {student.parentEmail}
                </a>
              </div>
            </div>
          )}

          {/* Statut */}
          {student.isActive !== undefined && (
            <div className="pt-2 border-t">
              <Badge variant={student.isActive ? 'default' : 'secondary'}>
                {student.isActive ? 'Actif' : 'Inactif'}
              </Badge>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
