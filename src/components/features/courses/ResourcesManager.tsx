// ResourcesManager - Refactorisé
// 523 lignes → ~230 lignes (sous-composants extraits)

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Plus,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  Loader2,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ResourceFormDialog, type ResourceType, type Resource } from './ResourceFormDialog';
import { 
  CourseFile, 
  resourceTypeConfig, 
  typeOrder, 
  ResourceItem, 
  CourseFilesSection 
} from './resources';

// Étend Resource avec order pour l'affichage
interface ResourceWithOrder extends Resource {
  order: number;
}

interface ResourcesManagerProps {
  courseId: string;
}

// Grouper les ressources par type
function groupByType(resources: ResourceWithOrder[]): Record<ResourceType, ResourceWithOrder[]> {
  return resources.reduce(
    (acc, resource) => {
      if (!acc[resource.type]) {
        acc[resource.type] = [];
      }
      acc[resource.type].push(resource);
      return acc;
    },
    {} as Record<ResourceType, ResourceWithOrder[]>
  );
}

export function ResourcesManager({ courseId }: ResourcesManagerProps) {
  const [resources, setResources] = useState<ResourceWithOrder[]>([]);
  const [courseFiles, setCourseFiles] = useState<CourseFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTypes, setExpandedTypes] = useState<Set<ResourceType>>(
    new Set(['LINK', 'YOUTUBE', 'PDF', 'DOCUMENT', 'EXCEL', 'POWERPOINT', 'IMAGE'])
  );

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [deleteResourceId, setDeleteResourceId] = useState<string | null>(null);

  // Fetch resources
  const fetchResources = useCallback(async () => {
    try {
      const res = await fetch(`/api/teacher/courses/${courseId}/resources`);
      if (res.ok) {
        const data = await res.json();
        setResources(data);
      }
    } catch (error) {
      console.error('Erreur fetch resources:', error);
    }
  }, [courseId]);

  // Fetch course files (uploaded files)
  const fetchCourseFiles = useCallback(async () => {
    try {
      const res = await fetch(`/api/teacher/courses/${courseId}`);
      if (res.ok) {
        const data = await res.json();
        setCourseFiles(data.course?.files || []);
      }
    } catch (error) {
      console.error('Erreur fetch course files:', error);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchResources();
    fetchCourseFiles();
  }, [fetchResources, fetchCourseFiles]);

  // Toggle type expansion
  const toggleType = (type: ResourceType) => {
    setExpandedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  // Create/Edit resource
  const handleSubmit = async (data: {
    title: string;
    description?: string;
    type: ResourceType;
    url?: string;
    fileUrl?: string;
  }) => {
    try {
      if (editingResource) {
        const res = await fetch(`/api/teacher/resources/${editingResource.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (res.ok) await fetchResources();
      } else {
        const res = await fetch(`/api/teacher/courses/${courseId}/resources`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (res.ok) await fetchResources();
      }
    } catch (error) {
      console.error('Erreur save resource:', error);
    }
    setDialogOpen(false);
    setEditingResource(null);
  };

  // Delete resource
  const handleDelete = async () => {
    if (!deleteResourceId) return;
    try {
      const res = await fetch(`/api/teacher/resources/${deleteResourceId}`, {
        method: 'DELETE',
      });
      if (res.ok) await fetchResources();
    } catch (error) {
      console.error('Erreur delete resource:', error);
    }
    setDeleteResourceId(null);
  };

  const openCreate = () => {
    setEditingResource(null);
    setDialogOpen(true);
  };

  const openEdit = (resource: Resource) => {
    setEditingResource(resource);
    setDialogOpen(true);
  };

  const groupedResources = groupByType(resources);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Section Fichiers uploadés */}
      <CourseFilesSection files={courseFiles} />

      {/* Section Ressources pédagogiques */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Base de connaissances
          </CardTitle>
          <Button onClick={openCreate} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Ajouter une ressource
          </Button>
        </CardHeader>
        <CardContent>
          {resources.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FolderOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Aucune ressource ajoutée</p>
              <p className="text-sm">
                Ajoutez des liens, vidéos ou documents pour enrichir votre cours
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {typeOrder.map((type) => {
                const typeResources = groupedResources[type] || [];
                if (typeResources.length === 0) return null;

                const config = resourceTypeConfig[type];
                const Icon = config.icon;
                const isExpanded = expandedTypes.has(type);

                return (
                  <Collapsible
                    key={type}
                    open={isExpanded}
                    onOpenChange={() => toggleType(type)}
                  >
                    <div className="border rounded-lg">
                      <CollapsibleTrigger asChild>
                        <div className="flex items-center gap-2 p-3 bg-muted/50 cursor-pointer hover:bg-muted/70">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                          <Icon className="h-4 w-4" />
                          <span className="font-medium">{config.label}</span>
                          <Badge variant="secondary" className="text-xs">
                            {typeResources.length}
                          </Badge>
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="p-3 pt-0 space-y-2">
                          {typeResources.map((resource) => (
                            <ResourceItem
                              key={resource.id}
                              resource={resource}
                              onEdit={() => openEdit(resource)}
                              onDelete={() => setDeleteResourceId(resource.id)}
                            />
                          ))}
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resource Dialog */}
      <ResourceFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        resource={editingResource}
        onSubmit={handleSubmit}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteResourceId} onOpenChange={() => setDeleteResourceId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette ressource ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
