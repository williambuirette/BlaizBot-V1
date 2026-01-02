// src/components/features/courses/ResourcesManager.tsx
// Gestionnaire de la base de connaissances d'un cours

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  Pencil,
  Trash2,
  Link,
  Youtube,
  FileText,
  Image,
  File,
  FileSpreadsheet,
  Presentation,
  Video,
  Music,
  Table,
  FolderOpen,
  Loader2,
  ExternalLink,
  Download,
  Upload,
} from 'lucide-react';
import { ResourceFormDialog, type ResourceType, type Resource, type ResourceFormData } from './ResourceFormDialog';
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

// Types importés depuis ResourceFormDialog
// ResourceType, Resource, ResourceFormData

// Type pour les fichiers uploadés (CourseFile)
interface CourseFile {
  id: string;
  filename: string;
  url: string;
  fileType: string;
}

// Étend Resource avec order pour l'affichage
interface ResourceWithOrder extends Resource {
  order: number;
}

interface ResourcesManagerProps {
  courseId: string;
}

// Icône colorée selon le type de fichier
function getCourseFileIcon(fileType: string) {
  switch (fileType) {
    case 'pdf':
      return <FileText className="h-6 w-6 text-red-500" />;
    case 'word':
      return <FileText className="h-6 w-6 text-blue-500" />;
    case 'excel':
      return <FileSpreadsheet className="h-6 w-6 text-green-500" />;
    case 'powerpoint':
      return <Presentation className="h-6 w-6 text-orange-500" />;
    case 'image':
      return <Image className="h-6 w-6 text-purple-500" />;
    case 'video':
      return <Video className="h-6 w-6 text-pink-500" />;
    case 'audio':
      return <Music className="h-6 w-6 text-yellow-500" />;
    default:
      return <File className="h-6 w-6 text-gray-500" />;
  }
}

// Mapping des icônes et labels par type
const resourceTypeConfig = {
  LINK: { icon: Link, label: 'Liens externes', color: 'bg-blue-100 text-blue-800' },
  YOUTUBE: { icon: Youtube, label: 'Vidéos YouTube', color: 'bg-red-100 text-red-800' },
  PDF: { icon: FileText, label: 'Documents PDF', color: 'bg-orange-100 text-orange-800' },
  DOCUMENT: { icon: File, label: 'Documents Word', color: 'bg-purple-100 text-purple-800' },
  EXCEL: { icon: Table, label: 'Tableurs Excel', color: 'bg-emerald-100 text-emerald-800' },
  POWERPOINT: { icon: FileText, label: 'Présentations PowerPoint', color: 'bg-amber-100 text-amber-800' },
  IMAGE: { icon: Image, label: 'Images', color: 'bg-green-100 text-green-800' },
};

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
  const [filesExpanded, setFilesExpanded] = useState(true);

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
      setLoading(false)
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
        // Update
        const res = await fetch(`/api/teacher/resources/${editingResource.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (res.ok) {
          await fetchResources();
        }
      } else {
        // Create
        const res = await fetch(`/api/teacher/courses/${courseId}/resources`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (res.ok) {
          await fetchResources();
        }
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
      if (res.ok) {
        await fetchResources();
      }
    } catch (error) {
      console.error('Erreur delete resource:', error);
    }
    setDeleteResourceId(null);
  };

  // Open dialogs
  const openCreate = () => {
    setEditingResource(null);
    setDialogOpen(true);
  };

  const openEdit = (resource: Resource) => {
    setEditingResource(resource);
    setDialogOpen(true);
  };

  const groupedResources = groupByType(resources);
  const typeOrder: ResourceType[] = ['LINK', 'YOUTUBE', 'PDF', 'DOCUMENT', 'EXCEL', 'POWERPOINT', 'IMAGE'];

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
      {courseFiles.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Upload className="h-5 w-5" />
              Fichiers uploadés ({courseFiles.length})
            </CardTitle>
            <CardDescription>
              Documents ajoutés lors de la création/modification du cours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Collapsible open={filesExpanded} onOpenChange={setFilesExpanded}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full justify-start mb-2">
                  {filesExpanded ? (
                    <ChevronDown className="h-4 w-4 mr-2" />
                  ) : (
                    <ChevronRight className="h-4 w-4 mr-2" />
                  )}
                  {filesExpanded ? 'Masquer' : 'Afficher'} les fichiers
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="grid gap-2 sm:grid-cols-2">
                  {courseFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="shrink-0">{getCourseFileIcon(file.fileType)}</div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate" title={file.filename}>
                          {file.filename}
                        </p>
                        <p className="text-xs text-muted-foreground uppercase">
                          {file.fileType}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                          <a href={file.url} target="_blank" rel="noopener noreferrer" title="Ouvrir">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                          <a href={file.url} download={file.filename} title="Télécharger">
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>
      )}

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
                      {/* Type Header */}
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

                      {/* Resources List */}
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

// ResourceItem component
interface ResourceItemProps {
  resource: Resource;
  onEdit: () => void;
  onDelete: () => void;
}

function ResourceItem({ resource, onEdit, onDelete }: ResourceItemProps) {
  const config = resourceTypeConfig[resource.type];
  const Icon = config.icon;

  // Extract YouTube video ID for thumbnail
  const getYouTubeThumbnail = (url: string | null) => {
    if (!url) return null;
    const match = url.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    return match ? `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg` : null;
  };

  const youtubeThumb =
    resource.type === 'YOUTUBE' ? getYouTubeThumbnail(resource.url) : null;

  return (
    <div className="flex items-start gap-3 p-3 rounded-md hover:bg-muted/50 group">
      {/* Thumbnail for YouTube */}
      {youtubeThumb ? (
        <div className="relative w-24 h-14 rounded overflow-hidden shrink-0">
          <img
            src={youtubeThumb}
            alt={resource.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <Youtube className="h-6 w-6 text-white" />
          </div>
        </div>
      ) : (
        <div
          className={`p-2 rounded ${config.color} shrink-0`}
        >
          <Icon className="h-4 w-4" />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{resource.title}</span>
          <Badge className={`text-xs ${config.color}`} variant="secondary">
            {resource.type}
          </Badge>
        </div>
        {resource.description && (
          <p className="text-sm text-muted-foreground line-clamp-1">
            {resource.description}
          </p>
        )}
        {/* Link preview */}
        {(resource.url || resource.fileUrl) && (
          <a
            href={resource.url || resource.fileUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1"
          >
            {resource.type === 'PDF' || resource.type === 'IMAGE' ? (
              <>
                <Download className="h-3 w-3" />
                Télécharger
              </>
            ) : (
              <>
                <ExternalLink className="h-3 w-3" />
                {resource.url?.slice(0, 40)}
                {(resource.url?.length || 0) > 40 ? '...' : ''}
              </>
            )}
          </a>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
